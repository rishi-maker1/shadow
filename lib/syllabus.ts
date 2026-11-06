export type Exam = "JEE" | "NEET" | "CBSE10" | "CBSE12" | "CLASS11" | "CLASS12";
export type Subject = string;

export interface Subtopic {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "weak" | "not-started";
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Chapter {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface SubjectData {
  subject: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

export type SyllabusDB = Record<Exam, SubjectData[]>;

export const SYLLABUS: SyllabusDB = {
  JEE: [
    {
      subject: "Physics",
      icon: "⚛️",
      color: "#0ea5e9",
      chapters: [
        {
          id: "jee-phy-01",
          name: "Units & Dimensions",
          subtopics: [
            { id: "jee-phy-01-01", name: "Dimensional Analysis", status: "completed", difficulty: "Easy" },
            { id: "jee-phy-01-02", name: "Error Analysis", status: "in-progress", difficulty: "Medium" },
            { id: "jee-phy-01-03", name: "Significant Figures", status: "not-started", difficulty: "Easy" },
          ],
        },
        {
          id: "jee-phy-02",
          name: "Kinematics",
          subtopics: [
            { id: "jee-phy-02-01", name: "Motion in 1D - Equations", status: "in-progress", difficulty: "Medium" },
            { id: "jee-phy-02-02", name: "Projectile Motion", status: "weak", difficulty: "Hard" },
            { id: "jee-phy-02-03", name: "Relative Motion", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-phy-03",
          name: "Laws of Motion & Friction",
          subtopics: [
            { id: "jee-phy-03-01", name: "Newton's Laws", status: "completed", difficulty: "Medium" },
            { id: "jee-phy-03-02", name: "Friction - Static & Kinetic", status: "weak", difficulty: "Medium" },
            { id: "jee-phy-03-03", name: "Circular Motion Dynamics", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-phy-04",
          name: "Work, Energy & Power",
          subtopics: [
            { id: "jee-phy-04-01", name: "Work-Energy Theorem", status: "in-progress", difficulty: "Medium" },
            { id: "jee-phy-04-02", name: "Conservative Forces & Potential", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-04-03", name: "Collisions - Elastic/Inelastic", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-phy-05",
          name: "Rotational Mechanics",
          subtopics: [
            { id: "jee-phy-05-01", name: "Moment of Inertia", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-05-02", name: "Angular Momentum Conservation", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-05-03", name: "Rolling Motion", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-phy-06",
          name: "Gravitation",
          subtopics: [
            { id: "jee-phy-06-01", name: "Kepler's Laws", status: "completed", difficulty: "Medium" },
            { id: "jee-phy-06-02", name: "Gravitational Potential", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-phy-07",
          name: "Electrostatics",
          subtopics: [
            { id: "jee-phy-07-01", name: "Coulomb's Law & Electric Field", status: "weak", difficulty: "Hard" },
            { id: "jee-phy-07-02", name: "Gauss's Law Applications", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-07-03", name: "Capacitors & Dielectrics", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-phy-08",
          name: "Current Electricity",
          subtopics: [
            { id: "jee-phy-08-01", name: "Ohm's Law & Kirchhoff's Rules", status: "completed", difficulty: "Medium" },
            { id: "jee-phy-08-02", name: "Meter Bridge & Potentiometer", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-phy-09",
          name: "Optics - Ray & Wave",
          subtopics: [
            { id: "jee-phy-09-01", name: "Mirrors & Lenses Formula", status: "not-started", difficulty: "Medium" },
            { id: "jee-phy-09-02", name: "Interference - Young's Experiment", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-09-03", name: "Diffraction & Polarisation", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-phy-10",
          name: "Modern Physics",
          subtopics: [
            { id: "jee-phy-10-01", name: "Photoelectric Effect", status: "weak", difficulty: "Medium" },
            { id: "jee-phy-10-02", name: "Bohr Model & X-rays", status: "not-started", difficulty: "Hard" },
            { id: "jee-phy-10-03", name: "Nuclear Physics & Radioactivity", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      subject: "Chemistry",
      icon: "🧪",
      color: "#10b981",
      chapters: [
        {
          id: "jee-che-01",
          name: "Mole Concept & Stoichiometry",
          subtopics: [
            { id: "jee-che-01-01", name: "Molarity & Molality", status: "completed", difficulty: "Easy" },
            { id: "jee-che-01-02", name: "Limiting Reagent", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-che-02",
          name: "Atomic Structure",
          subtopics: [
            { id: "jee-che-02-01", name: "Quantum Numbers & Orbitals", status: "weak", difficulty: "Medium" },
            { id: "jee-che-02-02", name: "Photoelectric & Bohr Model", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-che-03",
          name: "Chemical Bonding",
          subtopics: [
            { id: "jee-che-03-01", name: "VSEPR & Hybridisation", status: "in-progress", difficulty: "Hard" },
            { id: "jee-che-03-02", name: "MO Theory & Resonance", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-che-04",
          name: "Thermodynamics & Equilibrium",
          subtopics: [
            { id: "jee-che-04-01", name: "First & Second Law", status: "not-started", difficulty: "Hard" },
            { id: "jee-che-04-02", name: "Chemical & Ionic Equilibrium", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-che-05",
          name: "Organic - General & Isomerism",
          subtopics: [
            { id: "jee-che-05-01", name: "IUPAC & GOC", status: "completed", difficulty: "Medium" },
            { id: "jee-che-05-02", name: "Stereoisomerism", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-che-06",
          name: "Hydrocarbons & Reaction Mechanism",
          subtopics: [
            { id: "jee-che-06-01", name: "Electrophilic Addition", status: "in-progress", difficulty: "Hard" },
            { id: "jee-che-06-02", name: "Aromatic Substitution", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-che-07",
          name: "Electrochemistry",
          subtopics: [
            { id: "jee-che-07-01", name: "Nernst Equation", status: "not-started", difficulty: "Medium" },
            { id: "jee-che-07-02", name: "Conductance & Kohlrausch", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-che-08",
          name: "Coordination Compounds",
          subtopics: [
            { id: "jee-che-08-01", name: "Werner Theory & Nomenclature", status: "in-progress", difficulty: "Medium" },
            { id: "jee-che-08-02", name: "Crystal Field Theory", status: "weak", difficulty: "Hard" },
          ],
        },
      ],
    },
    {
      subject: "Mathematics",
      icon: "📐",
      color: "#f59e0b",
      chapters: [
        {
          id: "jee-mat-01",
          name: "Sets, Relations & Functions",
          subtopics: [
            { id: "jee-mat-01-01", name: "Functions - Domain & Range", status: "completed", difficulty: "Easy" },
            { id: "jee-mat-01-02", name: "Inverse & Composite Functions", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-mat-02",
          name: "Complex Numbers & Quadratic",
          subtopics: [
            { id: "jee-mat-02-01", name: "Argand Plane & De Moivre", status: "weak", difficulty: "Medium" },
            { id: "jee-mat-02-02", name: "Quadratic Roots & Inequalities", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "jee-mat-03",
          name: "Sequences & Series",
          subtopics: [
            { id: "jee-mat-03-01", name: "AP, GP, HP", status: "completed", difficulty: "Medium" },
            { id: "jee-mat-03-02", name: "Summation Techniques", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-mat-04",
          name: "Calculus - Limits & Derivatives",
          subtopics: [
            { id: "jee-mat-04-01", name: "Limits & Continuity", status: "in-progress", difficulty: "Medium" },
            { id: "jee-mat-04-02", name: "Differentiability & Methods", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-mat-05",
          name: "Integral Calculus",
          subtopics: [
            { id: "jee-mat-05-01", name: "Indefinite Integration", status: "not-started", difficulty: "Hard" },
            { id: "jee-mat-05-02", name: "Definite Integrals & Area", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-mat-06",
          name: "Coordinate Geometry",
          subtopics: [
            { id: "jee-mat-06-01", name: "Straight Lines & Circles", status: "in-progress", difficulty: "Medium" },
            { id: "jee-mat-06-02", name: "Parabola, Ellipse, Hyperbola", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-mat-07",
          name: "Vectors & 3D Geometry",
          subtopics: [
            { id: "jee-mat-07-01", name: "Vector Operations & Triple Product", status: "weak", difficulty: "Medium" },
            { id: "jee-mat-07-02", name: "3D Lines & Planes", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "jee-mat-08",
          name: "Probability & Statistics",
          subtopics: [
            { id: "jee-mat-08-01", name: "Conditional Probability & Bayes", status: "not-started", difficulty: "Medium" },
            { id: "jee-mat-08-02", name: "Binomial & Distributions", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
  NEET: [
    {
      subject: "Physics",
      icon: "⚛️",
      color: "#0ea5e9",
      chapters: [
        {
          id: "neet-phy-01",
          name: "Mechanics - Kinematics & Laws",
          subtopics: [
            { id: "neet-phy-01-01", name: "Kinematics Graphs", status: "in-progress", difficulty: "Medium" },
            { id: "neet-phy-01-02", name: "Friction & Inclined Plane", status: "weak", difficulty: "Medium" },
          ],
        },
        {
          id: "neet-phy-02",
          name: "Thermodynamics & KTG",
          subtopics: [
            { id: "neet-phy-02-01", name: "Heat Transfer & Calorimetry", status: "completed", difficulty: "Medium" },
            { id: "neet-phy-02-02", name: "KTG & Laws of Thermo", status: "in-progress", difficulty: "Hard" },
          ],
        },
        {
          id: "neet-phy-03",
          name: "Electrodynamics",
          subtopics: [
            { id: "neet-phy-03-01", name: "Electrostatics - Field & Potential", status: "weak", difficulty: "Hard" },
            { id: "neet-phy-03-02", name: "Current & Magnetism", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "neet-phy-04",
          name: "Optics & Modern Physics",
          subtopics: [
            { id: "neet-phy-04-01", name: "Ray Optics - Lens Maker", status: "not-started", difficulty: "Medium" },
            { id: "neet-phy-04-02", name: "Photoelectric & Nuclei", status: "weak", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      subject: "Chemistry",
      icon: "🧪",
      color: "#10b981",
      chapters: [
        {
          id: "neet-che-01",
          name: "Physical Chemistry Basics",
          subtopics: [
            { id: "neet-che-01-01", name: "Mole & Atomic Structure", status: "completed", difficulty: "Medium" },
            { id: "neet-che-01-02", name: "Thermodynamics", status: "in-progress", difficulty: "Hard" },
          ],
        },
        {
          id: "neet-che-02",
          name: "Organic Chemistry",
          subtopics: [
            { id: "neet-che-02-01", name: "General Organic & Isomerism", status: "weak", difficulty: "Hard" },
            { id: "neet-che-02-02", name: "Biomolecules & Polymers", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "neet-che-03",
          name: "Inorganic Chemistry",
          subtopics: [
            { id: "neet-che-03-01", name: "Periodic Table & Bonding", status: "in-progress", difficulty: "Medium" },
            { id: "neet-che-03-02", name: "p-block & Coordination", status: "not-started", difficulty: "Hard" },
          ],
        },
      ],
    },
    {
      subject: "Biology",
      icon: "🧬",
      color: "#ec4899",
      chapters: [
        {
          id: "neet-bio-01",
          name: "Cell - Structure & Function",
          subtopics: [
            { id: "neet-bio-01-01", name: "Cell Theory & Organelles", status: "completed", difficulty: "Easy" },
            { id: "neet-bio-01-02", name: "Cell Cycle & Division", status: "in-progress", difficulty: "Medium" },
            { id: "neet-bio-01-03", name: "Biomolecules & Enzymes", status: "weak", difficulty: "Medium" },
          ],
        },
        {
          id: "neet-bio-02",
          name: "Plant Physiology",
          subtopics: [
            { id: "neet-bio-02-01", name: "Photosynthesis - Light & Dark", status: "weak", difficulty: "Hard" },
            { id: "neet-bio-02-02", name: "Respiration & Transpiration", status: "not-started", difficulty: "Medium" },
            { id: "neet-bio-02-03", name: "Plant Growth Regulators", status: "not-started", difficulty: "Easy" },
          ],
        },
        {
          id: "neet-bio-03",
          name: "Human Physiology",
          subtopics: [
            { id: "neet-bio-03-01", name: "Circulation & Breathing", status: "in-progress", difficulty: "Medium" },
            { id: "neet-bio-03-02", name: "Neural Control & Coordination", status: "weak", difficulty: "Hard" },
            { id: "neet-bio-03-03", name: "Endocrine System", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "neet-bio-04",
          name: "Genetics & Evolution",
          subtopics: [
            { id: "neet-bio-04-01", name: "Mendel & Inheritance", status: "completed", difficulty: "Hard" },
            { id: "neet-bio-04-02", name: "Molecular Basis - DNA & RNA", status: "in-progress", difficulty: "Hard" },
            { id: "neet-bio-04-03", name: "Evolution & Evidence", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "neet-bio-05",
          name: "Ecology & Environment",
          subtopics: [
            { id: "neet-bio-05-01", name: "Ecosystem & Biogeochemical Cycles", status: "completed", difficulty: "Easy" },
            { id: "neet-bio-05-02", name: "Biodiversity & Conservation", status: "in-progress", difficulty: "Easy" },
          ],
        },
        {
          id: "neet-bio-06",
          name: "Reproduction",
          subtopics: [
            { id: "neet-bio-06-01", name: "Sexual Reproduction in Flowering Plants", status: "weak", difficulty: "Medium" },
            { id: "neet-bio-06-02", name: "Human Reproduction & Health", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
  CBSE10: [
    {
      subject: "Science",
      icon: "🔬",
      color: "#8b5cf6",
      chapters: [
        {
          id: "cb10-sci-01",
          name: "Chemical Reactions & Acids",
          subtopics: [
            { id: "cb10-sci-01-01", name: "Balancing & Types of Reactions", status: "completed", difficulty: "Easy" },
            { id: "cb10-sci-01-02", name: "pH & Salts", status: "in-progress", difficulty: "Easy" },
          ],
        },
        {
          id: "cb10-sci-02",
          name: "Life Processes",
          subtopics: [
            { id: "cb10-sci-02-01", name: "Nutrition & Respiration", status: "weak", difficulty: "Medium" },
            { id: "cb10-sci-02-02", name: "Circulation & Excretion", status: "not-started", difficulty: "Medium" },
          ],
        },
        {
          id: "cb10-sci-03",
          name: "Light & Electricity",
          subtopics: [
            { id: "cb10-sci-03-01", name: "Reflection & Refraction", status: "in-progress", difficulty: "Medium" },
            { id: "cb10-sci-03-02", name: "Ohm's Law & Power", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      subject: "Mathematics",
      icon: "📐",
      color: "#f59e0b",
      chapters: [
        {
          id: "cb10-mat-01",
          name: "Real Numbers & Polynomials",
          subtopics: [
            { id: "cb10-mat-01-01", name: "Euclid's Lemma & Factorization", status: "completed", difficulty: "Easy" },
          ],
        },
        {
          id: "cb10-mat-02",
          name: "Coordinate & Triangles",
          subtopics: [
            { id: "cb10-mat-02-01", name: "Distance & Section Formula", status: "in-progress", difficulty: "Easy" },
            { id: "cb10-mat-02-02", name: "Similarity & Pythagoras", status: "weak", difficulty: "Medium" },
          ],
        },
        {
          id: "cb10-mat-03",
          name: "Trigonometry & Applications",
          subtopics: [
            { id: "cb10-mat-03-01", name: "Ratios & Identities", status: "weak", difficulty: "Medium" },
          ],
        },
      ],
    },
  ],
  CBSE12: [
    {
      subject: "Physics",
      icon: "⚛️",
      color: "#0ea5e9",
      chapters: [
        {
          id: "cb12-phy-01",
          name: "Electrostatics & Current",
          subtopics: [
            { id: "cb12-phy-01-01", name: "Electric Charges & Fields (NCERT Ch1-2)", status: "completed", difficulty: "Medium" },
            { id: "cb12-phy-01-02", name: "Current Electricity & Kirchhoff", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "cb12-phy-02",
          name: "Magnetism & EMI",
          subtopics: [
            { id: "cb12-phy-02-01", name: "Moving Charges & Magnetism", status: "weak", difficulty: "Hard" },
            { id: "cb12-phy-02-02", name: "Electromagnetic Induction & AC", status: "not-started", difficulty: "Hard" },
          ],
        },
        {
          id: "cb12-phy-03",
          name: "Optics & Modern Physics",
          subtopics: [
            { id: "cb12-phy-03-01", name: "Ray & Wave Optics", status: "not-started", difficulty: "Medium" },
            { id: "cb12-phy-03-02", name: "Dual Nature & Nuclei", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      subject: "Chemistry",
      icon: "🧪",
      color: "#10b981",
      chapters: [
        {
          id: "cb12-che-01",
          name: "Solutions & Electrochemistry",
          subtopics: [
            { id: "cb12-che-01-01", name: "Colligative Properties", status: "completed", difficulty: "Medium" },
            { id: "cb12-che-01-02", name: "Galvanic Cells & Nernst", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "cb12-che-02",
          name: "Organic Conversion",
          subtopics: [
            { id: "cb12-che-02-01", name: "Haloalkanes & Alcohols", status: "weak", difficulty: "Hard" },
            { id: "cb12-che-02-02", name: "Biomolecules", status: "not-started", difficulty: "Easy" },
          ],
        },
      ],
    },
    {
      subject: "Mathematics",
      icon: "📐",
      color: "#f59e0b",
      chapters: [
        {
          id: "cb12-mat-01",
          name: "Relations, Functions & Calculus",
          subtopics: [
            { id: "cb12-mat-01-01", name: "Inverse Trig & Continuity", status: "completed", difficulty: "Medium" },
            { id: "cb12-mat-01-02", name: "Applications of Derivatives", status: "in-progress", difficulty: "Medium" },
          ],
        },
        {
          id: "cb12-mat-02",
          name: "Integrals & Differential Equations",
          subtopics: [
            { id: "cb12-mat-02-01", name: "Indefinite & Definite Integrals", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "cb12-mat-03",
          name: "Vectors, 3D & Probability",
          subtopics: [
            { id: "cb12-mat-03-01", name: "Vectors & 3D Geometry", status: "not-started", difficulty: "Hard" },
            { id: "cb12-mat-03-02", name: "Linear Programming & Probability", status: "not-started", difficulty: "Medium" },
          ],
        },
      ],
    },
    {
      subject: "Biology",
      icon: "🧬",
      color: "#ec4899",
      chapters: [
        {
          id: "cb12-bio-01",
          name: "Reproduction & Genetics",
          subtopics: [
            { id: "cb12-bio-01-01", name: "Reproduction in Organisms", status: "completed", difficulty: "Medium" },
            { id: "cb12-bio-01-02", name: "Principles of Inheritance", status: "weak", difficulty: "Hard" },
          ],
        },
        {
          id: "cb12-bio-02",
          name: "Biotechnology & Ecology",
          subtopics: [
            { id: "cb12-bio-02-01", name: "Biotechnology Principles", status: "in-progress", difficulty: "Medium" },
            { id: "cb12-bio-02-02", name: "Ecosystem & Biodiversity", status: "not-started", difficulty: "Easy" },
          ],
        },
      ],
    },
  ],
  CLASS11: [
    {
      subject: "Physics",
      icon: "⚛️",
      color: "#0ea5e9",
      chapters: [
        { id: "c11-phy-01", name: "Physical World & Units and Measurements", subtopics: [{ id: "c11-phy-01-01", name: "Dimensional Analysis & Errors", status: "completed", difficulty: "Easy" }, { id: "c11-phy-01-02", name: "Vernier & Screw Gauge", status: "in-progress", difficulty: "Easy" }] },
        { id: "c11-phy-02", name: "Motion in a Straight Line", subtopics: [{ id: "c11-phy-02-01", name: "Distance, Velocity, Acceleration", status: "in-progress", difficulty: "Medium" }, { id: "c11-phy-02-02", name: "Equations & Graphs", status: "weak", difficulty: "Medium" }] },
        { id: "c11-phy-03", name: "Motion in a Plane", subtopics: [{ id: "c11-phy-03-01", name: "Vectors & Resolution", status: "weak", difficulty: "Medium" }, { id: "c11-phy-03-02", name: "Projectile & Circular Motion", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-phy-04", name: "Laws of Motion", subtopics: [{ id: "c11-phy-04-01", name: "Inertia & Newton Laws", status: "completed", difficulty: "Medium" }, { id: "c11-phy-04-02", name: "Friction & Banking", status: "weak", difficulty: "Medium" }] },
        { id: "c11-phy-05", name: "Work, Energy and Power", subtopics: [{ id: "c11-phy-05-01", name: "Work-Energy Theorem", status: "in-progress", difficulty: "Medium" }, { id: "c11-phy-05-02", name: "Collisions", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-phy-06", name: "System of Particles & Rotational Motion", subtopics: [{ id: "c11-phy-06-01", name: "Centre of Mass & Moment of Inertia", status: "not-started", difficulty: "Hard" }, { id: "c11-phy-06-02", name: "Angular Momentum & Rolling", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-phy-07", name: "Gravitation", subtopics: [{ id: "c11-phy-07-01", name: "Kepler & Orbital Velocity", status: "completed", difficulty: "Medium" }, { id: "c11-phy-07-02", name: "Potential & Energy", status: "in-progress", difficulty: "Medium" }] },
        { id: "c11-phy-08", name: "Mechanical Properties of Solids & Fluids", subtopics: [{ id: "c11-phy-08-01", name: "Stress-Strain & Bernoulli", status: "not-started", difficulty: "Medium" }, { id: "c11-phy-08-02", name: "Surface Tension & Viscosity", status: "not-started", difficulty: "Medium" }] },
        { id: "c11-phy-09", name: "Thermal Properties & Thermodynamics", subtopics: [{ id: "c11-phy-09-01", name: "Heat Transfer & Kinetic Theory", status: "weak", difficulty: "Medium" }, { id: "c11-phy-09-02", name: "First & Second Law", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-phy-10", name: "Oscillations & Waves", subtopics: [{ id: "c11-phy-10-01", name: "SHM & Pendulum", status: "not-started", difficulty: "Hard" }, { id: "c11-phy-10-02", name: "Wave Equation & Doppler", status: "not-started", difficulty: "Hard" }] },
      ],
    },
    {
      subject: "Chemistry",
      icon: "🧪",
      color: "#10b981",
      chapters: [
        { id: "c11-che-01", name: "Some Basic Concepts of Chemistry", subtopics: [{ id: "c11-che-01-01", name: "Mole Concept & Stoichiometry", status: "completed", difficulty: "Easy" }, { id: "c11-che-01-02", name: "Limiting Reagent & Concentration", status: "in-progress", difficulty: "Medium" }] },
        { id: "c11-che-02", name: "Structure of Atom", subtopics: [{ id: "c11-che-02-01", name: "Quantum Numbers & Electronic Configuration", status: "weak", difficulty: "Medium" }, { id: "c11-che-02-02", name: "Shapes of Orbitals", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-che-03", name: "Classification of Elements - Periodic Table", subtopics: [{ id: "c11-che-03-01", name: "Periodic Trends & Anomalies", status: "in-progress", difficulty: "Medium" }] },
        { id: "c11-che-04", name: "Chemical Bonding & Molecular Structure", subtopics: [{ id: "c11-che-04-01", name: "Lewis, VSEPR, Hybridisation", status: "weak", difficulty: "Hard" }, { id: "c11-che-04-02", name: "MO Theory", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-che-05", name: "States of Matter (Gases, Liquids)", subtopics: [{ id: "c11-che-05-01", name: "Gas Laws & Ideal Gas Equation", status: "completed", difficulty: "Medium" }] },
        { id: "c11-che-06", name: "Thermodynamics (Chem)", subtopics: [{ id: "c11-che-06-01", name: "Enthalpy, Entropy, Gibbs", status: "in-progress", difficulty: "Hard" }] },
        { id: "c11-che-07", name: "Equilibrium", subtopics: [{ id: "c11-che-07-01", name: "Chemical & Ionic Equilibrium", status: "weak", difficulty: "Hard" }, { id: "c11-che-07-02", name: "pH, Buffer, Solubility", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-che-08", name: "Redox Reactions", subtopics: [{ id: "c11-che-08-01", name: "Oxidation Number & Balancing", status: "completed", difficulty: "Medium" }] },
        { id: "c11-che-09", name: "Hydrogen & s/p/d/f Block", subtopics: [{ id: "c11-che-09-01", name: "s-block & Hydrogen", status: "not-started", difficulty: "Medium" }, { id: "c11-che-09-02", name: "p-Block Elements", status: "not-started", difficulty: "Medium" }] },
        { id: "c11-che-10", name: "Organic Chemistry Basics + Hydrocarbons", subtopics: [{ id: "c11-che-10-01", name: "IUPAC, GOC, Isomerism", status: "weak", difficulty: "Hard" }, { id: "c11-che-10-02", name: "Alkanes, Alkenes, Alkynes, Benzene", status: "not-started", difficulty: "Hard" }] },
      ],
    },
    {
      subject: "Biology",
      icon: "🧬",
      color: "#ec4899",
      chapters: [
        { id: "c11-bio-01", name: "Diversity in Living World", subtopics: [{ id: "c11-bio-01-01", name: "The Living World & Biological Classification", status: "completed", difficulty: "Easy" }, { id: "c11-bio-01-02", name: "Plant & Animal Kingdom", status: "in-progress", difficulty: "Easy" }] },
        { id: "c11-bio-02", name: "Structural Organisation", subtopics: [{ id: "c11-bio-02-01", name: "Morphology of Flowering Plants", status: "weak", difficulty: "Medium" }, { id: "c11-bio-02-02", name: "Anatomy & Animal Tissues", status: "not-started", difficulty: "Medium" }] },
        { id: "c11-bio-03", name: "Cell Structure & Function", subtopics: [{ id: "c11-bio-03-01", name: "Cell - Unit of Life & Biomolecules", status: "completed", difficulty: "Medium" }, { id: "c11-bio-03-02", name: "Cell Cycle & Division", status: "in-progress", difficulty: "Medium" }] },
        { id: "c11-bio-04", name: "Plant Physiology", subtopics: [{ id: "c11-bio-04-01", name: "Photosynthesis & Respiration", status: "weak", difficulty: "Hard" }, { id: "c11-bio-04-02", name: "Plant Growth & PGR", status: "not-started", difficulty: "Easy" }] },
        { id: "c11-bio-05", name: "Human Physiology", subtopics: [{ id: "c11-bio-05-01", name: "Breathing, Circulation & Excretion", status: "in-progress", difficulty: "Medium" }, { id: "c11-bio-05-02", name: "Locomotion, Neural & Chemical Coordination", status: "not-started", difficulty: "Hard" }] },
      ],
    },
    {
      subject: "Mathematics",
      icon: "📐",
      color: "#f59e0b",
      chapters: [
        { id: "c11-mat-01", name: "Sets, Relations & Functions", subtopics: [{ id: "c11-mat-01-01", name: "Sets & Functions - Domain/Range", status: "completed", difficulty: "Easy" }, { id: "c11-mat-01-02", name: "Trigonometric Functions", status: "weak", difficulty: "Medium" }] },
        { id: "c11-mat-02", name: "Complex Numbers, Quadratic & Linear Inequalities", subtopics: [{ id: "c11-mat-02-01", name: "Complex Plane & Quadratic Roots", status: "in-progress", difficulty: "Medium" }] },
        { id: "c11-mat-03", name: "Permutations, Combinations & Binomial Theorem", subtopics: [{ id: "c11-mat-03-01", name: "PC & Binomial Expansion", status: "weak", difficulty: "Medium" }] },
        { id: "c11-mat-04", name: "Sequences & Series", subtopics: [{ id: "c11-mat-04-01", name: "AP, GP, HP & Sum to n terms", status: "completed", difficulty: "Medium" }] },
        { id: "c11-mat-05", name: "Straight Lines & Conic Sections", subtopics: [{ id: "c11-mat-05-01", name: "Lines, Circles", status: "in-progress", difficulty: "Medium" }, { id: "c11-mat-05-02", name: "Parabola, Ellipse, Hyperbola", status: "not-started", difficulty: "Hard" }] },
        { id: "c11-mat-06", name: "3D, Limits, Derivatives & Reasoning", subtopics: [{ id: "c11-mat-06-01", name: "3D Geometry", status: "not-started", difficulty: "Medium" }, { id: "c11-mat-06-02", name: "Limits & Derivatives", status: "weak", difficulty: "Hard" }] },
        { id: "c11-mat-07", name: "Statistics & Probability", subtopics: [{ id: "c11-mat-07-01", name: "Mean, Variance & Probability", status: "not-started", difficulty: "Medium" }] },
      ],
    },
  ],
  CLASS12: [
    {
      subject: "Physics",
      icon: "⚛️",
      color: "#0ea5e9",
      chapters: [
        { id: "c12-phy-01", name: "Electric Charges & Fields", subtopics: [{ id: "c12-phy-01-01", name: "Coulomb's Law & Electric Field", status: "completed", difficulty: "Medium" }, { id: "c12-phy-01-02", name: "Gauss's Law & Applications", status: "weak", difficulty: "Hard" }] },
        { id: "c12-phy-02", name: "Electrostatic Potential & Capacitance", subtopics: [{ id: "c12-phy-02-01", name: "Potential, Equipotentials & Capacitors", status: "in-progress", difficulty: "Medium" }] },
        { id: "c12-phy-03", name: "Current Electricity", subtopics: [{ id: "c12-phy-03-01", name: "Drift, Ohm's Law, Kirchhoff & Potentiometer", status: "completed", difficulty: "Medium" }] },
        { id: "c12-phy-04", name: "Moving Charges & Magnetism", subtopics: [{ id: "c12-phy-04-01", name: "Biot-Savart, Ampere & Cyclotron", status: "weak", difficulty: "Hard" }] },
        { id: "c12-phy-05", name: "Magnetism & Matter + EMI + AC", subtopics: [{ id: "c12-phy-05-01", name: "Earth's Magnetism", status: "in-progress", difficulty: "Easy" }, { id: "c12-phy-05-02", name: "EMI, Inductance & AC Circuits", status: "not-started", difficulty: "Hard" }] },
        { id: "c12-phy-06", name: "Electromagnetic Waves", subtopics: [{ id: "c12-phy-06-01", name: "Displacement Current & EM Spectrum", status: "completed", difficulty: "Easy" }] },
        { id: "c12-phy-07", name: "Ray Optics & Optical Instruments", subtopics: [{ id: "c12-phy-07-01", name: "Mirrors, Lenses, Prism & Microscope", status: "weak", difficulty: "Medium" }] },
        { id: "c12-phy-08", name: "Wave Optics", subtopics: [{ id: "c12-phy-08-01", name: "Interference, Young, Diffraction & Polarisation", status: "not-started", difficulty: "Hard" }] },
        { id: "c12-phy-09", name: "Dual Nature & Atoms", subtopics: [{ id: "c12-phy-09-01", name: "Photoelectric & Bohr Model", status: "in-progress", difficulty: "Medium" }] },
        { id: "c12-phy-10", name: "Nuclei, Semiconductors & Communication", subtopics: [{ id: "c12-phy-10-01", name: "Radioactivity & Binding Energy", status: "weak", difficulty: "Medium" }, { id: "c12-phy-10-02", name: "Semiconductors, Diodes & Logic Gates", status: "not-started", difficulty: "Medium" }] },
      ],
    },
    {
      subject: "Chemistry",
      icon: "🧪",
      color: "#10b981",
      chapters: [
        { id: "c12-che-01", name: "The Solid State & Solutions", subtopics: [{ id: "c12-che-01-01", name: "Crystal Lattices & Colligative Properties", status: "completed", difficulty: "Medium" }] },
        { id: "c12-che-02", name: "Electrochemistry", subtopics: [{ id: "c12-che-02-01", name: "Conductance, Galvanic Cells & Nernst", status: "weak", difficulty: "Hard" }] },
        { id: "c12-che-03", name: "Chemical Kinetics", subtopics: [{ id: "c12-che-03-01", name: "Rate Laws, Order & Arrhenius", status: "in-progress", difficulty: "Medium" }] },
        { id: "c12-che-04", name: "Surface Chemistry & General Principles of Isolation", subtopics: [{ id: "c12-che-04-01", name: "Colloids, Adsorption & Metallurgy", status: "not-started", difficulty: "Easy" }] },
        { id: "c12-che-05", name: "p, d, f Block Elements", subtopics: [{ id: "c12-che-05-01", name: "p-Block & d-Block Properties", status: "weak", difficulty: "Medium" }, { id: "c12-che-05-02", name: "Coordination Compounds - CFT & Isomerism", status: "not-started", difficulty: "Hard" }] },
        { id: "c12-che-06", name: "Haloalkanes, Alcohols, Phenols, Ethers & Aldehydes/Ketones/Acids", subtopics: [{ id: "c12-che-06-01", name: "Haloalkanes to Alcohols Mechanism", status: "in-progress", difficulty: "Hard" }, { id: "c12-che-06-02", name: "Carbonyl & Carboxylic Chemistry", status: "weak", difficulty: "Hard" }] },
        { id: "c12-che-07", name: "Amines & Biomolecules + Polymers", subtopics: [{ id: "c12-che-07-01", name: "Amines & Diazonium", status: "not-started", difficulty: "Medium" }, { id: "c12-che-07-02", name: "Biomolecules, Polymers & Chemistry in Everyday Life", status: "not-started", difficulty: "Easy" }] },
      ],
    },
    {
      subject: "Biology",
      icon: "🧬",
      color: "#ec4899",
      chapters: [
        { id: "c12-bio-01", name: "Reproduction", subtopics: [{ id: "c12-bio-01-01", name: "Reproduction in Organisms & Flowering Plants", status: "completed", difficulty: "Medium" }, { id: "c12-bio-01-02", name: "Human Reproduction & Reproductive Health", status: "weak", difficulty: "Medium" }] },
        { id: "c12-bio-02", name: "Genetics & Evolution", subtopics: [{ id: "c12-bio-02-01", name: "Inheritance & Molecular Basis", status: "in-progress", difficulty: "Hard" }, { id: "c12-bio-02-02", name: "Evolution & Evidence", status: "not-started", difficulty: "Medium" }] },
        { id: "c12-bio-03", name: "Biology & Human Welfare", subtopics: [{ id: "c12-bio-03-01", name: "Health, Microbes, Immunology", status: "weak", difficulty: "Medium" }] },
        { id: "c12-bio-04", name: "Biotechnology", subtopics: [{ id: "c12-bio-04-01", name: "Principles, Tools & Applications", status: "in-progress", difficulty: "Hard" }] },
        { id: "c12-bio-05", name: "Ecology", subtopics: [{ id: "c12-bio-05-01", name: "Organisms, Populations, Ecosystem & Biodiversity", status: "completed", difficulty: "Easy" }] },
      ],
    },
    {
      subject: "Mathematics",
      icon: "📐",
      color: "#f59e0b",
      chapters: [
        { id: "c12-mat-01", name: "Relations & Functions + Inverse Trigonometry", subtopics: [{ id: "c12-mat-01-01", name: "Types of Relations & ITF", status: "completed", difficulty: "Medium" }] },
        { id: "c12-mat-02", name: "Matrices & Determinants", subtopics: [{ id: "c12-mat-02-01", name: "Operations & Properties", status: "weak", difficulty: "Medium" }] },
        { id: "c12-mat-03", name: "Continuity & Differentiability", subtopics: [{ id: "c12-mat-03-01", name: "Continuity, Differentiability & Chain Rule", status: "in-progress", difficulty: "Hard" }] },
        { id: "c12-mat-04", name: "Applications of Derivatives", subtopics: [{ id: "c12-mat-04-01", name: "Tangents, Maxima/Minima & Rate", status: "weak", difficulty: "Hard" }] },
        { id: "c12-mat-05", name: "Integrals", subtopics: [{ id: "c12-mat-05-01", name: "Indefinite & Definite + Properties", status: "in-progress", difficulty: "Hard" }, { id: "c12-mat-05-02", name: "Area Under Curve", status: "not-started", difficulty: "Hard" }] },
        { id: "c12-mat-06", name: "Differential Equations", subtopics: [{ id: "c12-mat-06-01", name: "Order, Degree & Formation/Solution", status: "not-started", difficulty: "Hard" }] },
        { id: "c12-mat-07", name: "Vectors & 3D Geometry + Linear Programming + Probability", subtopics: [{ id: "c12-mat-07-01", name: "Vector & 3D", status: "weak", difficulty: "Hard" }, { id: "c12-mat-07-02", name: "LPP & Probability - Bayes & Binomial", status: "not-started", difficulty: "Medium" }] },
      ],
    },
  ],
};

export const EXAM_META = {
  JEE: { label: "JEE Main & Advanced", desc: "Physics • Chemistry • Mathematics · Full 11+12", color: "from-indigo-600 to-violet-600", students: "12.5L+" },
  NEET: { label: "NEET UG", desc: "Physics • Chemistry • Biology · Full 11+12", color: "from-emerald-600 to-teal-600", students: "20L+" },
  CBSE10: { label: "CBSE Class 10", desc: "Science • Maths • SST", color: "from-amber-600 to-orange-600", students: "22L+" },
  CBSE12: { label: "CBSE Class 12 — Boards", desc: "Physics • Chemistry • Maths • Biology", color: "from-pink-600 to-rose-600", students: "16L+" },
  CLASS11: { label: "Class 11 — Foundation", desc: "Physics • Chemistry • Biology • Maths · Full NCERT", color: "from-sky-600 to-cyan-600", students: "Full Syllabus" },
  CLASS12: { label: "Class 12 — Foundation", desc: "Physics • Chemistry • Biology • Maths · Full NCERT", color: "from-fuchsia-600 to-purple-600", students: "Full Syllabus" },
} as const;
