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
 <span>Sahaayak Solution</span>
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
 The premier platform to connect with experienced bakery chefs and helpers. Find the right professionals for your bakery.
 </p>
<div className="hero-buttons">
<button className="btn primary  " onClick={handleOwnerClick}>I'm a Bakery Owner</button>
<button className="btn secondary " onClick={handleChefClick}>I'm a Chef/Helper</button>
</div>
</section>

{/* Why Choose Section */} {/*or mene yha ref ko joda */} 
<section className="whychoose" ref={featuresRef}>
<h2>Why Choose Sahaayak Solution?</h2>
<p>
    We make it easy to find the right expertise for your bakery or discover the perfect professional
    connections.
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
        <div className="feature-icon">👤</div>
        <h3>Access to Direct Profiles</h3>
        <p>
            View verified chef profiles and instantly unlock contact details to connect directly with top talent.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">⚡</div>
        <h3>Instant Direct Contact</h3>
        <p>
            Connect directly with nearby professionals and fulfill your bakery needs without waiting.
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
        <h3>On-Demand Availability</h3>
        <p>
             Find verified bakery professionals whenever you need them and connect directly to keep your operations smooth.
        </p>
    </div>

    <div className="feature-card">
        <div className="feature-icon">🤝</div>
        <h3>Verified Network</h3>
        <p>
           Connect with a growing network of trusted bakery chefs and helpers in one central platform.
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
          <h4>Browse Directory</h4>
          <p>Search for verified chefs and helpers based on skills, location, and availability.</p>
         </div>
     </div>

     {/* Step 2 */}
       <div className="process-step">
         <div className="step-number">2</div>
         <div className="step-content">
           <h4>Review Profiles</h4>
           <p>View profiles and specialties of qualified professionals.</p>
         </div>
       </div> 

        {/* Step 3 */}
        <div className="process-step">
          <div className="step-number">3</div>   
           <div className="step-content">
            <h4>Unlock & Connect</h4>
            <p>Access direct contact details and connect instantly with the right professional.</p>
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
                <h4>Create Profile</h4>
                <p>Showcase your skills, experience, and service availability.</p>
            </div>
        </div>

        {/* Step 2 */}
        <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
                <h4>Get Discovered</h4>
                <p>Let local bakery owners find your profile in the directory.</p>
            </div>
        </div>

        {/* Step 3 */}
        <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
                <h4>Direct Connections</h4>
                <p> Receive direct calls and inquiries from bakery owners near you.</p>
            </div>       
        </div>

     </div>
     </div>

     </section>

</>
 );
}

export default LandingPage;


