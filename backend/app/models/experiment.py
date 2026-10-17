from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    dataset_name = Column(String(100), nullable=False)
    sample_limit = Column(Integer, default=50)
    train_count = Column(Integer, default=40)
    test_count = Column(Integer, default=10)
    feature_dim = Column(Integer, default=2)
    reps = Column(Integer, default=2)
    entanglement = Column(String(50), default="linear")
    scaling_factor = Column(Float, default=1.0)
    simulation_backend = Column(String(50), default="Statevector Fidelity")

    # Evaluation metrics
    qsvc_accuracy = Column(Float, nullable=True)
    qsvc_precision = Column(Float, nullable=True)
    qsvc_recall = Column(Float, nullable=True)
    qsvc_f1 = Column(Float, nullable=True)

    classical_accuracy = Column(Float, nullable=True)
    classical_precision = Column(Float, nullable=True)
    classical_recall = Column(Float, nullable=True)
    classical_f1 = Column(Float, nullable=True)

    # Timing metrics (in milliseconds)
    quantum_kernel_time_ms = Column(Float, nullable=True)
    qsvc_train_time_ms = Column(Float, nullable=True)
    qsvc_predict_time_ms = Column(Float, nullable=True)
    classical_train_time_ms = Column(Float, nullable=True)
    classical_predict_time_ms = Column(Float, nullable=True)

    # Detailed artifacts stored as JSON text
    kernel_matrix_train = Column(Text, nullable=True)
    kernel_matrix_test = Column(Text, nullable=True)
    confusion_matrix_quantum = Column(Text, nullable=True)
    confusion_matrix_classical = Column(Text, nullable=True)
    classification_report_quantum = Column(Text, nullable=True)
    classification_report_classical = Column(Text, nullable=True)
    circuit_ascii = Column(Text, nullable=True)

    status = Column(String(50), default="completed")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="experiments")
