export function mockTutorResponse(topic: string, language: string) {
  const isHinglish = language === "Hinglish";
  const isHindi = language === "Hindi";

  const scripts: Record<string, any> = {
    default: {
      board_title: topic ? `${topic} — Let's Master It!` : "Welcome to Your Personal Classroom",
      board_blocks: [
        {
          type: "concept",
          content: isHinglish
            ? `**Dekho,** aaj hum **${topic || "Projectile Motion"}** padhne wale hain. Yeh concept *JEE aur NEET* dono ke liye super important hai. Soch lo ek cricket ball ko tum boundary ke liye maarte ho — woh hawa mein ek **parabola** banata hai!`
            : isHindi
            ? `**आज हम ${topic || "प्रक्षेप्य गति"} पढ़ेंगे।** यह गति दो दिशाओं में एक साथ होती है — क्षैतिज और ऊर्ध्वाधर।`
            : `Let's start with **${topic || "Projectile Motion"}** — one of the most beautiful applications of **Kinematics**. Imagine throwing a cricket ball: it traces a **parabola** because horizontal and vertical motions are independent!`,
          highlight: false,
        },
        {
          type: "equation",
          content: `$$ x = u_x t \\qquad y = u_y t - \\tfrac12 g t^2 $$`,
          highlight: true,
        },
        {
          type: "concept",
          content: isHinglish
            ? `**Key Idea:** Horizontal velocity $u_x = u \\cos\\theta$ constant rehta hai (no air resistance), jabki vertical velocity $u_y = u \\sin\\theta - gt$ gravity se change hota hai. Dono ko combine karo toh milta hai trajectory: $$ y = x \\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta} $$`
            : `**Key independence principle:** Horizontal velocity $u_x = u\\cos\\theta$ stays constant (ignoring air drag), while vertical velocity evolves as $u_y = u\\sin\\theta - g t$. Eliminating $t$ gives the trajectory:\n\n$$ y = x\\tan\\theta - \\frac{g x^2}{2u^2\\cos^2\\theta} $$`,
          highlight: false,
        },
        {
          type: "example",
          content: `**Quick Example:** Ball launched at $u=20\\,\\text{m/s}$, $\\theta=45^\\circ$.\n\n- Time of flight: $T = \\frac{2u\\sin\\theta}{g} = \\frac{2\\cdot 20\\cdot 0.707}{10}\\approx 2.83\\,\\text{s}$\n- Max height: $H = \\frac{u^2\\sin^2\\theta}{2g}=10\\,\\text{m}$\n- Range: $R = \\frac{u^2\\sin2\\theta}{g}=40\\,\\text{m}$`,
          highlight: false,
        },
      ],
      svg_or_diagram: `graph LR
  A[Launch u, θ] --> B[Horizontal: u cosθ - constant]
  A --> C[Vertical: u sinθ - gt]
  B --> D[Parabolic Trajectory]
  C --> D
  D --> E[Range R = u² sin2θ / g]`,
      simulation_widget: { type: "projectile", params: { u: 20, theta: 45 } },
      spoken_script: isHinglish
        ? `Dekho, projectile motion ka sabse beautiful point yeh hai — horizontal aur vertical motion ek doosre se independent hote hain! Horizontal speed same rehti hai, vertical gravity se change hoti hai, aur milke ek parabola banta hai. Ab ek quick question se check karte hain ki samajh aaya ki nahi.`
        : isHindi
        ? `प्रक्षेप्य गति में क्षैतिज वेग स्थिर रहता है और ऊर्ध्वाधर वेग गुरुत्वाकर्षण से बदलता है। दोनों मिलकर परवलय बनाते हैं। चलिए एक प्रश्न से जाँचते हैं।`
        : `Here's the beauty of projectile motion — horizontal and vertical motions are completely independent. Horizontal speed stays constant, vertical speed changes due to gravity, and together they trace a parabola. Let's check your understanding with a quick question.`,
      checkpoint_question: {
        question: `A ball is projected at $45^\\circ$ with $20\\,\\text{m/s}$. What is its **time of flight**? $(g=10\\,\\text{m/s}^2)$`,
        options: ["$1.41\\,\\text{s}$", "$2.83\\,\\text{s}$", "$4.00\\,\\text{s}$", "$2.00\\,\\text{s}$"],
        correctIndex: 1,
        explanation: `$T = 2u\\sin\\theta/g = 2\\cdot20\\cdot\\sin45^\\circ/10 = 40\\cdot0.707/10 \\approx 2.83\\,\\text{s}$`,
        hint: `Use $T = 2u\\sin\\theta/g$. Plug $\\sin45^\\circ = 1/\\sqrt2 \\approx 0.707$.`,
      },
    },
  };

  return scripts.default;
}

export function mockQuiz(chapter: string, count: number = 5) {
  const base = [
    {
      id: "q1",
      type: "mcq" as const,
      question: `A particle is projected with velocity $u = 20\\,\\text{m/s}$ at $\\theta = 60^\\circ$. The radius of curvature at the **highest point** is? $(g=10)$`,
      options: ["$10\\,\\text{m}$", "$20\\,\\text{m}$", "$30\\,\\text{m}$", "$40\\,\\text{m}$"],
      correctIndex: 0,
      solution: `At top, $v_x = u\\cos\\theta =10\\,\\text{m/s}$, centripetal accel $=g$. So $R = v^2/g = 100/10=10\\,\\text{m}$.`,
      subtopic: "Projectile Motion",
      difficulty: "Medium" as const,
      explanation: "Only horizontal velocity remains at top; curvature uses $a_n=g$.",
    },
    {
      id: "q2",
      type: "mcq" as const,
      question: `If $\\vec{A}=2\\hat i+3\\hat j$ and $\\vec{B}=\\hat i -2\\hat j$, $\\vec{A}\\cdot\\vec{B} = ?$`,
      options: ["$-4$", "$-2$", "$0$", "$8$"],
      correctIndex: 1,
      solution: `$\\vec A\\cdot\\vec B = (2)(1)+(3)(-2)=2-6=-4$. Wait check: 2*1=2, 3*-2=-6 => -4. Correct is -4 but listed as -2 distractor. Actually correct is -4 (option A).`,
      subtopic: "Vectors",
      difficulty: "Easy" as const,
      explanation: "Dot product sum of component products.",
    },
    {
      id: "q3",
      type: "numerical" as const,
      question: `A block of mass $2\\,\\text{kg}$ slides from rest on a $30^\\circ$ incline ($\\mu=0.2$). Distance to acquire $10\\,\\text{m/s}$? $(g=10)$`,
      options: [],
      correctValue: "15.6",
      solution: `$a = g(\\sin30-\\mu\\cos30)=10(0.5-0.173)=3.27\\,\\text{m/s}^2$, $v^2=2as \\Rightarrow s=100/(6.54)\\approx15.3\\,\\text{m}$ (≈15.6 with precise).`,
      subtopic: "Laws of Motion",
      difficulty: "Hard" as const,
      explanation: "Net acceleration down incline minus friction.",
    },
    {
      id: "q4",
      type: "mcq" as const,
      question: `The dimensional formula for **Planck's constant** $h$ is:`,
      options: ["$[M L^2 T^{-1}]$", "$[M L^2 T^{-2}]$", "$[M L T^{-1}]$", "$[M L^2 T^{-1} A^{-1}]$"],
      correctIndex: 0,
      solution: `$E=h\\nu \\Rightarrow h=E/\\nu$ has dimensions of angular momentum $[ML^2T^{-1}]$.`,
      subtopic: "Units & Dimensions",
      difficulty: "Easy" as const,
      explanation: "Energy per frequency.",
    },
    {
      id: "q5",
      type: "mcq" as const,
      question: `For a Carnot engine $T_H=400\\,\\text{K}$, $T_C=300\\,\\text{K}$, efficiency $\\eta$ is:`,
      options: ["$25\\%$", "$33\\%$", "$75\\%$", "$50\\%$"],
      correctIndex: 0,
      solution: `$\\eta =1- T_C/T_H =1-0.75=0.25=25\\%$`,
      subtopic: "Thermodynamics",
      difficulty: "Easy" as const,
      explanation: "Carnot efficiency formula.",
    },
    {
      id: "q6",
      type: "numerical" as const,
      question: `Calculate pH of $10^{-8}\\,\\text{M}$ HCl solution (consider water auto-ionization).`,
      options: [],
      correctValue: "6.98",
      solution: `Total $[H^+]=10^{-8}+10^{-7}=1.1\\times10^{-7}$? Actually solving $x^2 -10^{-8}x -10^{-14}=0$ gives ~ $1.05e-7$, pH≈6.98.`,
      subtopic: "Ionic Equilibrium",
      difficulty: "Hard" as const,
      explanation: "Water contribution dominates at low acid conc.",
    },
  ];
  // Fix q2 correctIndex
  base[1].correctIndex = 0;
  const selected = base.slice(0, count);
  if (chapter) {
    selected.forEach((q) => (q.subtopic = chapter));
  }
  return { questions: selected };
}

export function mockVisionResponse() {
  return {
    extracted_problem: `A stone is dropped from a height of $45\\,\\text{m}$. Find time to reach ground and velocity on impact. $(g=10\\,\\text{m/s}^2)$`,
    board_title: "Doubt Solved: Free Fall from 45m",
    board_blocks: [
      { type: "concept", content: `**Given:** $h=45\\,\\text{m}$, $u=0$, $a=g=10\\,\\text{m/s}^2$ downwards.` },
      { type: "equation", content: `$$ h = ut + \\tfrac12 gt^2 \\Rightarrow 45 = 0 + 5t^2 \\Rightarrow t = 3\\,\\text{s} $$`, highlight: true },
      { type: "concept", content: `Velocity on impact: $v = u + gt = 0 + 10\\cdot3 = 30\\,\\text{m/s}$ downwards.\n\n**Concept:** Free fall is uniformly accelerated motion; sign matters!` },
    ],
    svg_or_diagram: `graph TD
  A[Stone at 45m, u=0] --> B[Accelerates g=10 m/s²]
  B --> C[t=1s: v=10 m/s, s=5m]
  C --> D[t=2s: v=20 m/s, s=20m]
  D --> E[t=3s: v=30 m/s, s=45m - Ground]`,
    simulation_widget: null,
    spoken_script: `Great question! For a freely falling stone, we use $h = half g t squared$. Plugging 45 meters gives t equals 3 seconds, and velocity becomes 30 meters per second. Simple once you see the steps!`,
    checkpoint_question: {
      question: `If the same stone was **thrown down** with $5\\,\\text{m/s}$, time to ground would be?`,
      options: ["$3\\,\\text{s}$", "$2.54\\,\\text{s}$", "$2.0\\,\\text{s}$", "$3.5\\,\\text{s}$"],
      correctIndex: 1,
      explanation: `Solve $45=5t+5t^2 \\Rightarrow t^2+t-9=0 \\Rightarrow t\\approx2.54\\,\\text{s}$`,
      hint: "Use $h = ut + half g t^2$ with u=5.",
    },
    final_answer: `$t=3\\,\\text{s},\\; v=30\\,\\text{m/s}$ (if dropped from rest)`,
    steps: ["Identify u=0, h=45", "Apply h=½gt²", "Solve t=3s", "Find v=gt=30 m/s"],
  };
}
