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
        "question": "When does registration take place at the University of Bamenda?",
        "answer": "At the University of Bamenda, registration typically begins in October and may extend into November depending on the academic calendar. Students are expected to complete administrative and academic registration within the deadlines set by their faculties. Late registration may be allowed with penalties.",
        "category": "registration",
        "faculty": "All Faculties"
    },
    {
        "question": "How do I register for courses at the University of Bamenda?",
        "answer": "Course registration is usually done at the faculty or department level. Students must first complete fee payment, then proceed to their department to select courses with the help of academic advisors. Some faculties may also provide partial online registration systems.",
        "category": "registration",
        "faculty": "All Faculties"
    },
    {
        "question": "What documents are required for registration?",
        "answer": "Students are required to present: 1) Admission letter, 2) Birth certificate, 3) Previous academic certificates (GCE Advanced Level or equivalent), 4) National ID card or receipt, 5) Passport photographs, and 6) Proof of fee payment.",
        "category": "registration",
        "faculty": "All Faculties"
    },

    # Academic Calendar
    {
        "question": "When does the academic year begin at the University of Bamenda?",
        "answer": "The academic year at the University of Bamenda usually begins in October. The exact dates are announced each year by the university administration through official communiqués.",
        "category": "academic-calendar",
        "faculty": "All Faculties"
    },
    {
        "question": "How is the academic year structured?",
        "answer": "The academic year is divided into two semesters. The first semester runs roughly from October to February, while the second semester runs from March to July. Each semester includes lectures, continuous assessment, and final examinations.",
        "category": "academic-calendar",
        "faculty": "All Faculties"
    },
    {
        "question": "When are examinations held?",
        "answer": "Examinations are held at the end of each semester. First semester exams usually take place around February, while second semester exams occur around June or July depending on the faculty.",
        "category": "academic-calendar",
        "faculty": "All Faculties"
    },

    # Examinations
    {
        "question": "What are the examination rules at the University of Bamenda?",
        "answer": "Students must present a valid student ID card before entering the examination hall. Late entry is usually restricted. Mobile phones and unauthorized materials are strictly prohibited. Any form of malpractice can lead to suspension or expulsion.",
        "category": "examinations",
        "faculty": "All Faculties"
    },
    {
        "question": "How can I check my results?",
        "answer": "Results are usually published on departmental notice boards. Some faculties may also provide results online or through student portals where available.",
        "category": "examinations",
        "faculty": "All Faculties"
    },
    {
        "question": "Can I resit a failed course?",
        "answer": "Yes, students who fail a course may be required to resit the examination during resit sessions or repeat the course in the following academic year depending on university regulations.",
        "category": "examinations",
        "faculty": "All Faculties"
    },

    # Fees
    {
        "question": "What are the tuition fees at the University of Bamenda?",
        "answer": "Tuition fees in Cameroonian state universities, including the University of Bamenda, are relatively affordable. Students typically pay around 50,000 FCFA per year for academic fees. Additional charges may apply for registration, medical services, and departmental levies.",
        "category": "fees",
        "faculty": "All Faculties"
    },
    {
        "question": "How are fees paid?",
        "answer": "Fees are usually paid through designated banks approved by the university. Students receive a receipt which must be presented during registration. Some faculties may integrate mobile money or digital payment options.",
        "category": "fees",
        "faculty": "All Faculties"
    },

    # Administrative Offices
    {
        "question": "What does the Registrar's Office do?",
        "answer": "The Registrar's Office manages admissions, student records, transcripts, and academic documentation. It is a key administrative office for all student-related academic matters.",
        "category": "offices",
        "faculty": "All Faculties"
    },
    {
        "question": "What services does Student Affairs provide?",
        "answer": "Student Affairs handles student welfare, discipline, accommodation issues, and extracurricular activities. It also supports student associations and campus life.",
        "category": "offices",
        "faculty": "All Faculties"
    },

    # Staff
    {
        "question": "Who is the Vice Chancellor of the University of Bamenda?",
        "answer": "The Vice Chancellor of the University of Bamenda is Professor Theresia Nkuo-Akenji. She oversees the academic and administrative management of the university.",
        "category": "staff",
        "faculty": "All Faculties"
    },

    # General
    {
        "question": "How do I obtain a transcript?",
        "answer": "To obtain a transcript, students must apply through the Registrar's Office. The process involves filling a request form and paying the required fee. Processing may take several days to weeks.",
        "category": "general",
        "faculty": "All Faculties"
    },
    {
        "question": "Can I change my program?",
        "answer": "Yes, students can request a change of program, usually at the beginning of the academic year. Approval must be obtained from both the current and receiving departments.",
        "category": "general",
        "faculty": "All Faculties"
    },
    {
        "question": "Can I defer my studies?",
        "answer": "Yes, students can request a deferment for valid reasons such as health or personal issues. Approval must be granted by the university administration.",
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
