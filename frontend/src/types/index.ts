export type int = number;

export interface User {
  id: int;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OTPResponse {
  message: string;
  email: string;
  otp_code?: string;
  expires_in_seconds: number;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  total_samples: number;
  features: number;
  classes: number;
  class_distribution: Record<string, number>;
  default_qubits: number;
  dimension_reduction_applied: boolean;
  reduction_technique?: string;
  scientific_context: string;
}

export interface SamplePoint {
  sample_idx: number;
  x: number;
  y: number;
  features: number[];
  label: number;
  split: 'train' | 'test';
}

export interface DatasetPreviewResponse {
  dataset_id: string;
  dataset_name: string;
  n_samples: number;
  n_train: number;
  n_test: number;
  n_features: number;
  classes: number[];
  class_distribution: Record<string, number>;
  points: SamplePoint[];
  feature_names: string[];
  table_preview: Record<string, any>[];
}

export interface SpectralProperties {
  eigenvalues: number[];
  condition_number: number;
  effective_dimension: number;
  rank: number;
  spectral_status: string;
}

export interface DecisionMeshPoint {
  x: number;
  y: number;
  qsvc_pred: number;
  classical_pred: number;
}

export interface KernelProperties {
  matrix_dim: number;
  min_val: number;
  max_val: number;
  is_symmetric: boolean;
  unit_diagonal: boolean;
  avg_fidelity: number;
  diagonal_tolerance: number;
  spectral?: SpectralProperties;
}

export interface ExperimentSummary {
  id: number;
  title: string;
  dataset_name: string;
  sample_limit: number;
  train_count: number;
  test_count: number;
  feature_dim: number;
  reps: number;
  entanglement: string;
  qsvc_accuracy?: number;
  qsvc_f1?: number;
  classical_accuracy?: number;
  classical_f1?: number;
  quantum_kernel_time_ms?: number;
  status: string;
  created_at: string;
}

export interface ExperimentDetail {
  id: number;
  title: string;
  dataset_name: string;
  sample_limit: number;
  train_count: number;
  test_count: number;
  feature_dim: number;
  reps: number;
  entanglement: string;
  scaling_factor: number;
  simulation_backend: string;

  qsvc_accuracy?: number;
  qsvc_precision?: number;
  qsvc_recall?: number;
  qsvc_f1?: number;

  classical_accuracy?: number;
  classical_precision?: number;
  classical_recall?: number;
  classical_f1?: number;

  quantum_kernel_time_ms?: number;
  qsvc_train_time_ms?: number;
  qsvc_predict_time_ms?: number;
  classical_train_time_ms?: number;
  classical_predict_time_ms?: number;

  kernel_matrix_train?: number[][];
  kernel_matrix_test?: number[][];
  confusion_matrix_quantum?: number[][];
  confusion_matrix_classical?: number[][];
  classification_report_quantum?: Record<string, any>;
  classification_report_classical?: Record<string, any>;
  circuit_ascii?: string;
  kernel_properties?: KernelProperties;
  decision_mesh?: DecisionMeshPoint[];
  noise_model?: string;
  noise_rate?: number;

  status: string;
  error_message?: string;
  created_at: string;
}

export interface CircuitPreviewResponse {
  feature_dim: number;
  reps: number;
  entanglement: string;
  num_qubits: number;
  num_parameters: number;
  circuit_depth: number;
  gate_counts: Record<string, number>;
  circuit_ascii: string;
  circuit_layers_description: {
    layer_name: string;
    description: string;
  }[];
  mathematical_formula: string;
}

export interface ExperimentRunPayload {
  title?: string;
  dataset_id: string;
  sample_limit: number;
  test_size: number;
  noise: number;
  random_seed: number;
  feature_dim: number;
  reps: number;
  entanglement: string;
  scaling: string;
  c_parameter: number;
  noise_model?: string;
  noise_rate?: number;
  compute_decision_mesh?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIChatResponse {
  reply: string;
  recommendations: string[];
  suggested_prompts: string[];
}

export interface AIAnalyzeResponse {
  experiment_id: number;
  executive_summary: string;
  quantum_vs_classical_critique: string;
  kernel_quality_assessment: string;
  spectral_health: string;
  hyperparameter_tuning_advice: string[];
  theoretical_context: string;
}

export interface ComparisonResponse {
  experiments: ExperimentDetail[];
  best_quantum_id?: number;
  best_classical_id?: number;
  summary_table: Record<string, any>[];
  ai_verdict: string;
}
