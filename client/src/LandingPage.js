import React, { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import  "./App.css";

function LandingPage() {
    const navigate = useNavigate();

   // Refs bnaye hai mene 
    const featuresRef = useRef(null);
    const howItWorksRef = useRef(null);
    
  //Click Handlers Functions ( jisse Smooth Scrolling hogi )  
    const scrollToFeatures = () => {
        featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToHowItWorks = () => {
        howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });

    }

    const handleOwnerClick = () => {
  // yha me owner ko loginsignp per bhej rha hu or state me 'owner' Type  bhej rha hu 
  // jisse pta chal jaye ki kon hai 
        navigate('/loginsignup', {state: {userType: 'owner' }});
    };

    const handleChefClick = () => {
  //yha me chef ko loginsignup per bhej rha hu or state me 'chef' Type bhej rha hu 
  //jisse pta chal jaye ki kon hai
        navigate('/loginsignup', {state: {userType: 'chef' }});

    };

    return(
<>
{/*Header Section */}
<nav className="navbar">
<div className="nav-logo">
 <img src="/logo1.png" alt="Bakery Chef Logo"/>
 <span>SahaayakSolution</span>
 </div>
<ul className="nav-links">
   { /* onClick handler ko mene yha joda hai  */}
    <li onClick={scrollToFeatures}>Features</li>
    <li onClick={scrollToHowItWorks}>How it Works</li>
</ul>
</nav>


{ /* Hero Section */}
<section className="hero">
<h1>Connect Bakery Owners with Skilled Professionals</h1>
 <p>
 The premier platform for hiring experienced bakery chefs and helpers. 
 Find the perfect match for your bakery needs.
 </p>
<div className="hero-buttons">
<button className="btn primary  " onClick={handleOwnerClick}>I'm a Bakery Owner</button>
<button className="btn secondary " onClick={handleChefClick}>I'm a Chef/Helper</button>
</div>
</section>

{/* Why Choose Section */} {/*or mene yha ref ko joda */} 
<section className="whychoose" ref={featuresRef}>
<h2>Why Choose SahaayakSolution?</h2>
<p>
    We make it easy to find the right talent for your bakery or the perfect
    job opportunity.
</p>

<div className="features-grid">
    <div className="feature-card">
        <div className="feature-icon">🛡️</div>
        <h3>Verified Professionals</h3>
        <p>
            All chefs and helpers are background-checked and verified for your
            peace of mind.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">⭐</div>
        <h3>Skill-Based Matching</h3>
        <p>
            Post a job and start receiving applications from qualified
            candidates within hours.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">⚡</div>
        <h3>Quick Hiring</h3>
        <p>
            Post a job and start receiving applications from qualified
            candidates within hours.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">📍</div>
        <h3>Local Focus</h3>
        <p>
            Connect with professionals in your area for easy coordination and
            reduced commute times.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">🕒</div>
        <h3>Flexible Scheduling</h3>
        <p>
             Post full-time, part-time, or temporary positions to match your
              bakery’s needs.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">🤝</div>
        <h3>Community Support</h3>
        <p>
            Join a community of bakery professionals sharing knowledge and
            growing together.
        </p>
    </div>
</div>
</section>

{ /* How It Works Section */ } {/*or mene yha ref ko joda */}
<section className="how-it-works" ref={howItWorksRef}>
    <div className="how-it-works-header">
        <h2>How It Works</h2>
        <p>Simple steps to connect bakery owners with professionals</p>
    </div>
      
     <div className="process-flow-container">

        {/* Left Column: Bakery Owners */}
        <div className="process-column">
        <h3>For Bakery Owners</h3>

        {/* Step 1 */}
     <div className="process-step">
         <div className="step-number">1</div>
         <div className="step-content">
          <h4>Post Your Job</h4>
          <p>Describe your bakery needs, required skills, and job details.</p>
         </div>
     </div>

     {/* Step 2 */}
       <div className="process-step">
         <div className="step-number">2</div>
         <div className="step-content">
           <h4>Review Applications</h4>
           <p>Browse profiles and applications from qualified professionals.</p>
         </div>
       </div> 

        {/* Step 3 */}
        <div className="process-step">
          <div className="step-number">3</div>   
           <div className="step-content">
            <h4>Hire & Connect</h4>
            <p>Interview and hire the perfect candidate for your bakery.</p>
          </div>         
        </div>  

     </div>

     {/* Right Column: Chefs & Helpers */}
     <div className="process-column">
        <h3>For Chefs & Helpers</h3>

        {/* Step 1 */}
        <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
                <h4>Create Your Profile</h4>
                <p>Showcase your skills, experience, and availability.</p>
            </div>
        </div>

        {/* Step 2 */}
        <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
                <h4>Browse Jobs</h4>
                <p>Search for opportunities that match your skills and preferences.</p>
            </div>
        </div>

        {/* Step 3 */}
        <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
                <h4>Apply & Get Hired</h4>
                <p>Apply to jobs and start your bakery career journey.</p>
            </div>       
        </div>

     </div>
     </div>

     </section>

</>
 );
}

export default LandingPage;


