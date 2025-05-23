import './styles-faq.css';

function Faqs() {
    return ( 
        <>
            <section className="faq-section">
                <div className="faq-header">
                    <h2>PREGUNTAS<span>FRECUENTES</span></h2>
                </div>

                <div className="faq-list">
                    <div className="faq-item">
                    <h3 className="faq-question">¿Cuál es la duración de los planes?</h3>
                    <p className="faq-answer">Todos los planes tienen una duración flexible y se adaptan a tu ritmo.</p>
                    </div>

                    <div className="faq-item">
                    <h3 className="faq-question">¿Qué necesito para empezar?</h3>
                    <p className="faq-answer">Solo motivación, ropa cómoda y conexión a internet.</p>
                    </div>

                    <div className="faq-item">
                    <h3 className="faq-question">¿Puedo hacer los entrenamientos en casa?</h3>
                    <p className="faq-answer">Sí, todos los programas están pensados para entrenar en casa o en el gym.</p>
                    </div>

                    <div className="faq-item">
                    <h3 className="faq-question">¿Hay seguimiento personalizado?</h3>
                    <p className="faq-answer">Sí, cada plan incluye asistencia directa según el tipo de suscripción.</p>
                    </div>
                </div>
            </section>
        </>
     );
}

export default Faqs;