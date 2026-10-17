import React from 'react';
import {
  GraduationCap,
  Atom,
  Binary,
  Layers,
  Cpu,
  Scale,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const EducationalPage: React.FC = () => {
  const workflowSteps = [
    { title: "Classical Benchmark Dataset", desc: "Nonlinear coordinates (e.g., Moons, Circles, Iris, Breast Cancer)", icon: Binary },
    { title: "Preprocessing & Scaling", desc: "Stratified train/test split, MinMax scaling to [0, 2π] phase angles without leakage", icon: Scale },
    { title: "ZZFeatureMap Construction", desc: "Unitary circuit with Hadamard gates, Rz phase shifts, and CNOT-Rz-CNOT interactions", icon: Cpu },
    { title: "Quantum State Encoding", desc: "Maps classical vector x to normalized statevector |φ(x)⟩ in 2ⁿ-dim Hilbert space", icon: Atom },
    { title: "Quantum Fidelity Kernel", desc: "Calculates state transition fidelity overlap: K(x, y) = |⟨0| U^†(y) U(x) |0⟩|²", icon: Sparkles },
    { title: "Quantum Kernel Gram Matrix", desc: "Symmetric, positive semi-definite Gram matrix K with unit diagonal K_ii = 1.0", icon: Layers },
    { title: "QSVC Dual Optimization", desc: "Solves quadratic programming SVM problem maximizing geometric margin in Hilbert space", icon: CheckCircle2 },
    { title: "Predictions & Evaluation", desc: "Predicts held-out test labels using test-vs-train kernel matrix K(x_test, x_train)", icon: GraduationCap },
    { title: "Classical SVM Comparison", desc: "Direct benchmark against Gaussian RBF kernel to evaluate quantum utility rigorously", icon: Scale },
  ];

  const topics = [
    {
      num: 1,
      title: "What is Quantum Machine Learning (QML)?",
      content: "Quantum Machine Learning merges quantum computing principles (superposition, entanglement, quantum interference) with statistical machine learning algorithms. In kernel-based QML, quantum circuits project low-dimensional classical data into an exponentially large Hilbert state space where complex nonlinear classification boundaries become linearly separable."
    },
    {
      num: 2,
      title: "What is a Quantum Feature Map?",
      content: "A quantum feature map is a parameterized quantum circuit U_Φ(x) that encodes a classical feature vector x ∈ ℝⁿ into a high-dimensional quantum state |φ(x)⟩ = U_Φ(x)|0⟩^⊗n. Unlike classical feature maps (such as polynomial expansions) which suffer from exponential computation bottlenecks, quantum circuits can represent exponentially large vector spaces with linear qubit overhead."
    },
    {
      num: 3,
      title: "How ZZFeatureMap Works",
      content: "The ZZFeatureMap is a second-order Pauli expansion circuit: U_Φ(x) = exp(i ∑_j ϕ_j(x) Z_j + ∑_{j<k} ϕ_jk(x) Z_j Z_k) H^⊗n. First, Hadamard gates place all qubits in superposition. Next, single-qubit Rz gates encode linear features ϕ_j(x) = x_j. Finally, two-qubit entangling gates CNOT-Rz(2(π - x_j)(π - x_k))-CNOT encode nonlinear pairwise interactions between feature pairs."
    },
    {
      num: 4,
      title: "What is Quantum Kernel Estimation?",
      content: "Given two data points x and y, the quantum fidelity kernel is defined as K(x, y) = |⟨φ(x) | φ(y)⟩|² = |⟨0| U^†(y) U(x) |0⟩|². It measures the transition probability between their encoded quantum states. On a quantum computer, this is estimated by executing U(x) followed by U^†(y) and measuring the all-zeros bitstring probability |00...0⟩."
    },
    {
      num: 5,
      title: "How QSVC Uses the Kernel Matrix",
      content: "The Quantum Support Vector Classifier (QSVC) operates on the precomputed kernel matrix K. It solves the standard dual Quadratic Programming problem: max_α ∑_i α_i - 0.5 ∑_{i,j} α_i α_j y_i y_j K(x_i, x_j) subject to 0 ≤ α_i ≤ C and ∑_i α_i y_i = 0. The quantum circuit evaluates the inner products, while a classical optimizer finds the optimal hyperplane."
    },
    {
      num: 6,
      title: "What Does a Classical SVM Do?",
      content: "A classical SVM with a Radial Basis Function (RBF) kernel evaluates similarity using Euclidean distance: K_RBF(x, y) = exp(-γ ||x - y||²). While powerful on spatial distance metrics, Gaussian RBF struggles when features exhibit complex entangled symmetries or topological periodicities that natural quantum circuits can capture."
    },
    {
      num: 7,
      title: "Why Nonlinear Classification Matters",
      content: "Real-world data—such as medical diagnostics, genomic sequences, and molecular bonds—rarely divide along straight lines or planes. In problems like Concentric Circles or Intertwined Moons, linear classifiers achieve only ~50% accuracy. Nonlinear kernels project the data so that concentric rings become separated vertically in the higher-dimensional space."
    },
    {
      num: 8,
      title: "Classical Simulation vs Quantum Hardware",
      content: "In this platform, kernel values are estimated via statevector simulation on a classical CPU, which computes algebraic matrix-vector products. On real Noisy Intermediate-Scale Quantum (NISQ) hardware, circuits are compiled into physical microwave pulses, subjecting measurements to thermal relaxation (T1), dephasing (T2), gate infidelity, and finite sampling shot noise."
    },
    {
      num: 9,
      title: "Limitations of Quantum Kernel Approaches",
      content: "Quantum kernels face theoretical constraints: as qubit count n grows, randomly initialized or overly deep circuits can cause exponential concentration of measure, where almost all pairs have fidelity approaching zero (the quantum kernel analogue of barren plateaus). Careful scaling and shallow circuits with appropriate entanglement are essential."
    },
    {
      num: 10,
      title: "Future Applications of Quantum Kernels",
      content: "Quantum kernel classifiers hold promise in domains with structured data: quantum chemistry (classifying molecular binding affinities), materials science (predicting crystal phases), financial risk modeling (detecting non-Euclidean market anomalies), and post-quantum cryptanalysis."
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Quantum Machine Learning Theory & Architecture
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono border border-violet-500/30">
                Foundations Guide
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Comprehensive conceptual foundations, mathematical formulations, and step-by-step workflow architecture 
              for High-Dimensional Quantum Kernel Support Vector Classification.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Workflow Flowchart Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
          <Layers className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            End-to-End Quantum Kernel Classification Workflow
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
                      {idx + 1}
                    </span>
                    <Icon className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Architectural Schematics Gallery */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-slate-200">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Quantum Architectural Visual References
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Schematic 1: Bloch Sphere */}
          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Single-Qubit Spherical Manifold
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                θ=2x₁, φ=2x₂
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center">
              <img src="/images/bloch_sphere.svg" alt="Bloch Sphere Diagram" className="w-full max-h-52 object-contain" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Classical coordinates map to rotation angles traversing the unit Bloch sphere with statevector |Φ(x)⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩.
            </p>
          </div>

          {/* Schematic 2: ZZ Interaction */}
          <div className="glass-panel rounded-2xl p-5 border border-violet-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Two-Qubit Entangling ZZ Coupler
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
                CNOT-Rz-CNOT
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center">
              <img src="/images/zz_gate_interaction.svg" alt="ZZ Gate Interaction Diagram" className="w-full max-h-52 object-contain" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Two-qubit Pauli ZZ coupling introduces non-classical quantum correlations that classical radial kernels cannot compute in polynomial time.
            </p>
          </div>

          {/* Schematic 3: Quantum Overlap */}
          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Quantum Fidelity Overlap Inner Product
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                K(x,y) = |⟨Φ(x)|Φ(y)⟩|²
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center">
              <img src="/images/quantum_kernel_overlap.svg" alt="Quantum Kernel Overlap Diagram" className="w-full max-h-52 object-contain" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Evaluates geometric similarity by measuring the squared overlap of statevectors encoded on the quantum simulator.
            </p>
          </div>

          {/* Schematic 4: 3D Quantum Gram Matrix */}
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                4. Quantum Gram Matrix Spectrum
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                K ∈ ℝ^(N×N)
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center">
              <img src="/images/quantum_kernel_matrix.png" alt="Quantum Kernel Matrix" className="w-full max-h-52 object-cover rounded-lg" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The full Gram matrix feeds directly into standard Support Vector dual solvers for optimal geometric hyperplane margin separation.
            </p>
          </div>
        </div>
      </div>

      {/* 10 Educational Chapters Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-slate-200">
          <GraduationCap className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Core Theoretical Curriculum (10 Sections)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t) => (
            <div
              key={t.num}
              className="glass-panel rounded-xl p-5 border border-cyan-500/15 hover:border-cyan-500/30 transition-all space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  {t.num}
                </span>
                <h3 className="text-xs font-bold text-white tracking-wide">{t.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed text-justify pl-7">
                {t.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
