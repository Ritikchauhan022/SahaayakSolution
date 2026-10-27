export const getAvatarColor = (name) => {
    if (!name) return "#4f46e5"; // Default Blue

    const firstLetter = name.trim().toUpperCase().charAt(0);

    // Ye wahi colors hain jo tumne AvailableProfessionals mein use kiye hain
    const colors = {
        A: "#f87171", B: "#fb923c", C: "#fbbf24", D: "#34d399", 
        E: "#2dd4bf", F: "#38bdf8", G: "#818cf8", H: "#c084fc",
        I: "#f472b6", J: "#fb7185", K: "#f87171", L: "#fb923c",
        M: "#fbbf24", N: "#34d399", O: "#2dd4bf", P: "#38bdf8",
        Q: "#818cf8", R: "#c084fc", S: "#f472b6", T: "#fb7185",
        U: "#f87171", V: "#fb923c", W: "#fbbf24", X: "#34d399",
        Y: "#2dd4bf", Z: "#38bdf8"
    };
    
    return colors[firstLetter] || "#4f46e5"; 
};