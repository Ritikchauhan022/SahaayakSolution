import React from 'react';
import { useNavigate } from 'react-router-dom';
import  "./App.css";

const LegalPage = ({title, content}) => {
    const navigate = useNavigate();

 // 👇 YE FUNCTION TEXT KO BOLD KAREGA
    const formatContent = (text) => {
      if (!text) return "";

 // Text ko lines mein todna
      return text.split('\n').map((line, index) => {
 // Check karna ki kya line mein **Heading** wala pattern hai
      const parts  = line.split(/(\*\*.*?\*\*)/g);

      return(
        <p key={index} style={{marginBottom: '15px', lineHeight: '1.6'}}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    // ** hata kar bold mein dikhana
                    return <strong key={i} style={{color: '#333', fontWeight: 'bold'}}>{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
            })}

        </p>
      );
        });
    };

 return (
        <div className="legal-container">
            <div className="legal-content-wrapper">
            <button className="footer-back-btn" onClick={() => navigate('/')}>
             ← Back to Home
            </button>
        <h1 className="legal-title">{title}</h1>
        <div className="legal-card">
            {/* 👇 YAHAN AB DIRECT CONTENT NAHI, FUNCTION CALL HOGA */}
            {formatContent(content)}
        </div>
        </div>

        </div>
    );
};

export default LegalPage;