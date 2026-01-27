from app import create_app, db
from app.models import AdminUser, FAQEntry
from app.services.embedding_service import EmbeddingService
import bcrypt

app = create_app()


def seed_admin_user():
    """Create default admin user"""
    with app.app_context():
        existing = AdminUser.query.filter_by(username='admin').first()
        if not existing:
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            admin = AdminUser(
                username='admin',
                password_hash=password_hash.decode('utf-8'),
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Created default admin user (admin/admin123)")
        else:
            print("Admin user already exists")


def seed_faq_data():
    """Seed mock FAQ data for testing"""
    mock_faqs = [
        # Registration
        {
            "question": "What are the registration deadlines for the first semester?",
            "answer": "Registration for the first semester opens on August 1st and closes on August 31st. Late registration is available from September 1st to September 15th with a late fee of $50. Students must complete all registration requirements including course selection, fee payment, and document submission before the deadline.",
            "category": "registration",
            "faculty": "All Faculties"
        },
        {
            "question": "How do I register for courses online?",
            "answer": "To register for courses online, follow these steps: 1) Log in to the Student Portal using your student ID and password. 2) Navigate to 'Course Registration' under the Academic menu. 3) Select your desired courses from the available options for your program. 4) Review your selections and click 'Submit Registration'. 5) Complete fee payment through the payment gateway. You will receive a confirmation email upon successful registration.",
            "category": "registration",
            "faculty": "All Faculties"
        },
        {
            "question": "What documents are required for course registration?",
            "answer": "The following documents are required for course registration: 1) Valid student ID card. 2) Proof of previous semester fee payment. 3) Academic clearance from the previous semester. 4) Any prerequisite course completion certificates if applicable. International students must also submit a valid visa and passport copies.",
            "category": "registration",
            "faculty": "All Faculties"
        },
        
        # Academic Calendar
        {
            "question": "When does the academic year begin?",
            "answer": "The academic year officially begins on the first Monday of September. Orientation week for new students starts one week prior on the last week of August. The academic calendar is published annually on the university website and includes all important dates such as registration periods, examination schedules, holidays, and semester breaks.",
            "category": "academic-calendar",
            "faculty": "All Faculties"
        },
        {
            "question": "What are the university holidays for this academic year?",
            "answer": "The university observes the following holidays: Independence Day (October 1st), Christmas Break (December 23rd - January 3rd), Easter Break (varies annually), and all national public holidays. Additionally, the university closes for a mid-semester break in each semester. The complete holiday calendar is available on the university website under Academic Calendar.",
            "category": "academic-calendar",
            "faculty": "All Faculties"
        },
        {
            "question": "When are the semester examinations scheduled?",
            "answer": "First semester examinations are scheduled for December 1st through December 15th. Second semester examinations are scheduled for May 1st through May 15th. The detailed examination timetable is published four weeks before examinations begin. Students should check the Examinations Office noticeboard and the university portal for their individual schedules.",
            "category": "academic-calendar",
            "faculty": "All Faculties"
        },
        
        # Examinations
        {
            "question": "What are the examination rules and regulations?",
            "answer": "Examination rules include: 1) Students must arrive 30 minutes before the scheduled time. 2) Only permitted materials (specified by the course) are allowed in the examination hall. 3) Mobile phones and smart devices are strictly prohibited. 4) Students must present a valid ID card to enter the hall. 5) No student may leave the hall within the first 30 minutes or the last 15 minutes of the examination. Violation of these rules may result in disqualification.",
            "category": "examinations",
            "faculty": "All Faculties"
        },
        {
            "question": "How do I apply for examination deferment?",
            "answer": "To apply for examination deferment: 1) Obtain the Examination Deferment Form from the Registrar's Office or download from the portal. 2) Complete the form with valid reasons (medical, bereavement, or other approved circumstances). 3) Attach supporting documentation (medical certificate, death certificate, etc.). 4) Submit to the Examinations Office at least 48 hours before the scheduled examination. 5) Await approval notification via email. Deferred examinations are scheduled during the supplementary examination period.",
            "category": "examinations",
            "faculty": "All Faculties"
        },
        {
            "question": "How can I check my examination results?",
            "answer": "Examination results are released through the Student Portal approximately three weeks after the examination period ends. To check your results: 1) Log in to the Student Portal. 2) Navigate to 'Academic Records' > 'Examination Results'. 3) Select the relevant semester. Results are also displayed on the Faculty notice boards. Official transcripts can be requested from the Registrar's Office.",
            "category": "examinations",
            "faculty": "All Faculties"
        },
        
        # Fees
        {
            "question": "What is the tuition fee for undergraduate programs?",
            "answer": "Undergraduate tuition fees vary by faculty and program: Faculty of Science: $3,500 per semester. Faculty of Arts: $3,000 per semester. Faculty of Engineering: $4,500 per semester. Faculty of Medicine: $6,000 per semester. Faculty of Law: $4,000 per semester. These fees are subject to annual review. Additional fees may apply for laboratory courses, field trips, and special programs.",
            "category": "fees",
            "faculty": "All Faculties"
        },
        {
            "question": "What payment methods are accepted for tuition fees?",
            "answer": "The university accepts the following payment methods: 1) Bank transfer to the university account (details on the portal). 2) Online payment via the Student Portal using debit/credit cards. 3) Bank draft payable to the university. 4) Payment at designated bank branches. Cash payments are not accepted. Payment receipts should be uploaded to the portal within 48 hours of payment.",
            "category": "fees",
            "faculty": "All Faculties"
        },
        {
            "question": "Is there a payment plan available for tuition fees?",
            "answer": "Yes, the university offers an installment payment plan. Students may pay fees in two installments: 60% at the beginning of the semester and 40% by mid-semester. To apply for the payment plan: 1) Complete the Payment Plan Application Form. 2) Submit to the Bursary Department before registration. 3) Receive approval within 5 working days. Late payment attracts a 5% penalty fee.",
            "category": "fees",
            "faculty": "All Faculties"
        },
        
        # Administrative Offices
        {
            "question": "Where is the Registrar's Office located?",
            "answer": "The Registrar's Office is located on the Ground Floor of the Main Administration Building, Room A-101. Office hours are Monday to Friday, 8:00 AM to 4:00 PM. The office handles student records, transcripts, enrollment verification, and graduation matters. Contact: registrar@university.edu, Phone: +1-234-567-8901.",
            "category": "offices",
            "faculty": "All Faculties"
        },
        {
            "question": "What does the Student Affairs Office handle?",
            "answer": "The Student Affairs Office handles: 1) Student welfare and counseling referrals. 2) Accommodation and housing matters. 3) Student organizations and clubs. 4) Disciplinary matters. 5) Student ID cards issuance. 6) General student inquiries. Location: Student Center Building, Room 205. Hours: 8:00 AM - 5:00 PM, Monday to Friday.",
            "category": "offices",
            "faculty": "All Faculties"
        },
        {
            "question": "How do I contact the Finance/Bursary Department?",
            "answer": "The Finance/Bursary Department is located in the Administration Building, Room B-201. Contact details: Email: bursary@university.edu, Phone: +1-234-567-8902. Office hours: 9:00 AM - 3:00 PM, Monday to Friday. The department handles fee payments, refunds, financial clearance, and scholarship disbursements.",
            "category": "offices",
            "faculty": "All Faculties"
        },
        
        # University Staff
        {
            "question": "Who is the Vice Chancellor of the university?",
            "answer": "The Vice Chancellor is Professor James Anderson, PhD. Professor Anderson has served as Vice Chancellor since 2020 and oversees all academic and administrative affairs of the university. His office is located in the Senate Building, Ground Floor. Appointments can be scheduled through the Vice Chancellor's Office: vc-office@university.edu.",
            "category": "staff",
            "faculty": "All Faculties"
        },
        {
            "question": "Who should I contact for academic matters in the Faculty of Science?",
            "answer": "For academic matters in the Faculty of Science, contact: Dean of Science: Professor Maria Chen, PhD - dean.science@university.edu. Associate Dean (Academic): Dr. Robert Williams - assoc.dean.science@university.edu. Faculty Officer: Mrs. Sarah Johnson - fo.science@university.edu. The Faculty Office is located in the Science Complex, Block A, Room 101.",
            "category": "staff",
            "faculty": "Faculty of Science"
        },
        {
            "question": "Who is the Dean of the Faculty of Engineering?",
            "answer": "The Dean of the Faculty of Engineering is Professor Michael Thompson, PhD, FEng. Professor Thompson oversees all academic programs, research activities, and administrative functions of the Engineering Faculty. Office: Engineering Building, Room 301. Contact: dean.engineering@university.edu, Phone: +1-234-567-8910.",
            "category": "staff",
            "faculty": "Faculty of Engineering"
        },
        
        # General
        {
            "question": "How do I apply for a transcript?",
            "answer": "To apply for an official transcript: 1) Log in to the Student Portal and navigate to 'Services' > 'Transcript Request'. 2) Select the type of transcript (official sealed or electronic). 3) Pay the transcript fee ($20 per copy). 4) Processing takes 5-7 working days. 5) Collect from the Registrar's Office or opt for postal delivery (additional fee applies). Unofficial transcripts can be downloaded immediately from the portal.",
            "category": "general",
            "faculty": "All Faculties"
        },
        {
            "question": "What is the process for changing my course or program?",
            "answer": "To change your course or program: 1) Obtain the Course/Program Change Form from the Registrar's Office. 2) Get approval from your current Department Head. 3) Get approval from the receiving Department Head. 4) Submit to the Registrar's Office with all required transcripts. 5) Await approval from the Academic Board (2-3 weeks). Changes are only permitted at the beginning of each semester and subject to availability.",
            "category": "general",
            "faculty": "All Faculties"
        },
        {
            "question": "How do I apply for a leave of absence?",
            "answer": "To apply for a leave of absence: 1) Complete the Leave of Absence Form (available at Registrar's Office or online). 2) Provide supporting documentation for your reason (medical, personal, etc.). 3) Obtain signatures from your Department Head and Dean. 4) Submit to the Registrar's Office. 5) Leave may be granted for one or two semesters. Students must apply for readmission before returning. Contact the Academic Advising Office for guidance.",
            "category": "general",
            "faculty": "All Faculties"
        }
    ]
    
    with app.app_context():
        existing_count = FAQEntry.query.count()
        if existing_count > 0:
            print(f"FAQ data already exists ({existing_count} entries). Skipping seed.")
            return
        
        print("Seeding FAQ data...")
        for faq in mock_faqs:
            # Generate embedding for the question
            embedding = EmbeddingService.generate_embedding(faq['question'])
            
            # Store embedding as JSON string for SQLite
            import json
            embedding_json = json.dumps(embedding) if embedding else None
            
            entry = FAQEntry(
                question=faq['question'],
                answer=faq['answer'],
                category=faq['category'],
                faculty=faq['faculty'],
                academic_year='2024-2025',
                embedding=embedding_json
            )
            db.session.add(entry)
        
        db.session.commit()
        print(f"Seeded {len(mock_faqs)} FAQ entries")


if __name__ == '__main__':
    seed_admin_user()
    seed_faq_data()
    print("\nSeeding complete!")
