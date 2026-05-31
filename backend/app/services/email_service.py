import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.config import SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_TO_EMAIL, IS_EMAIL_CONFIGURED, SUPABASE_URL, SUPABASE_KEY, IS_SUPABASE_CONFIGURED
from app.models import global_state, AlertNotification
import requests
import threading

class EmailService:
    @staticmethod
    def get_registered_emails() -> list:
        """Fetches all registered email addresses from the Supabase users table."""
        emails = []
        if IS_SUPABASE_CONFIGURED:
            try:
                url = f"{SUPABASE_URL}/rest/v1/users?select=email"
                headers = {
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
                r = requests.get(url, headers=headers, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    emails = [item["email"] for item in data if isinstance(item, dict) and "email" in item]
                    print(f"[Supabase Users Fetched]: Loaded {len(emails)} target alert receivers.")
            except Exception as e:
                print(f"[Supabase Users Fetch Error]: {str(e)}")
                
        # Also grab mock users emails
        try:
            from app.main import MOCK_USERS_DB
            for mu in MOCK_USERS_DB:
                m_email = mu.get("email", "").strip().lower()
                if m_email and m_email not in emails:
                    emails.append(m_email)
        except Exception:
            pass

        # Fallback to default TO_EMAIL if empty or not included
        if SMTP_TO_EMAIL and SMTP_TO_EMAIL not in emails:
            emails.append(SMTP_TO_EMAIL)
        return emails

    @staticmethod
    def send_alert(subject: str, body: str) -> bool:
        timestamp = datetime.now().strftime("%I:%M:%S %p")
        
        # 1. Log to system alerts history (always, for mock simulation and display)
        new_alert = AlertNotification(
            type="Email",
            subject=subject,
            body=body,
            timestamp=timestamp
        )
        global_state.alerts_history.insert(0, new_alert)
        print(f"[Email Alert Logged]: {subject} - {body}")

        # 2. If SMTP is configured, send the real email inside a background thread
        if IS_EMAIL_CONFIGURED:
            smtp_thread = threading.Thread(
                target=EmailService._smtp_worker,
                args=(subject, body),
                daemon=True
            )
            smtp_thread.start()
            
        return True

    @staticmethod
    def _smtp_worker(subject: str, body: str):
        recipients = EmailService.get_registered_emails()
        if not recipients:
            print("[SMTP Warning]: No recipients configured.")
            return

        clean_password = SMTP_PASSWORD.strip()
        clean_password_stripped = SMTP_PASSWORD.replace(" ", "")

        for recipient in recipients:
            try:
                msg = MIMEMultipart()
                msg['From'] = SMTP_USER
                msg['To'] = recipient
                msg['Subject'] = f"[Zentra Flora Alert] {subject}"
                msg.attach(MIMEText(body, 'plain'))
                
                server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
                server.starttls()
                server.login(SMTP_USER, clean_password)
                server.sendmail(SMTP_USER, recipient, msg.as_string())
                server.quit()
                print(f"[SMTP Email Sent Successfully to {recipient}]")
            except Exception as e:
                # Fallback: Try with all spaces stripped from password
                try:
                    msg = MIMEMultipart()
                    msg['From'] = SMTP_USER
                    msg['To'] = recipient
                    msg['Subject'] = f"[Zentra Flora Alert] {subject}"
                    msg.attach(MIMEText(body, 'plain'))
                    
                    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
                    server.starttls()
                    server.login(SMTP_USER, clean_password_stripped)
                    server.sendmail(SMTP_USER, recipient, msg.as_string())
                    server.quit()
                    print(f"[SMTP Email Sent Successfully (Spaces Stripped) to {recipient}]")
                except Exception as inner_e:
                    print(f"[SMTP Background Email Failed for {recipient} Error]: {str(inner_e)}")


        
    @staticmethod
    def send_welcome_email(email: str) -> bool:
        """Sends a Telegram bot subscription link uniquely to a newly signed in user email."""
        subject = "Welcome to Zentra Flora Greenhouse! 🌿"
        body = (
            f"Hello,\n\n"
            f"Thank you for registering at Zentra Flora Automated Greenhouse System!\n\n"
            f"To complete your automated warning setup and start chatting with our plant care agent directly inside Telegram, "
            f"please click the link below to subscribe to our bot:\n"
            f"👉 https://t.me/melmalebot 👈\n\n"
            f"Best regards,\n"
            f"Zentra Flora AI Control System"
        )
        
        # Dispatch SMTP uniquely to the new email in the background
        if IS_EMAIL_CONFIGURED:
            def worker():
                try:
                    msg = MIMEMultipart()
                    msg['From'] = SMTP_USER
                    msg['To'] = email
                    msg['Subject'] = subject
                    msg.attach(MIMEText(body, 'plain'))
                    
                    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
                    server.starttls()
                    server.login(SMTP_USER, SMTP_PASSWORD.strip())
                    server.sendmail(SMTP_USER, email, msg.as_string())
                    server.quit()
                    print(f"[SMTP Welcome Email Dispatched Successfully to {email}]")
                except Exception as e:
                    # Strip spaces fallback
                    try:
                        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
                        server.starttls()
                        server.login(SMTP_USER, SMTP_PASSWORD.replace(" ", ""))
                        server.sendmail(SMTP_USER, email, msg.as_string())
                        server.quit()
                        print(f"[SMTP Welcome Email Dispatched (Spaces Stripped) to {email}]")
                    except Exception as inner_e:
                        print(f"[SMTP Welcome Email Failed for {email} Error]: {str(inner_e)}")

            t = threading.Thread(target=worker, daemon=True)
            t.start()
            
        return True

