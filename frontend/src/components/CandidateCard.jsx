import "./CandidateCard.css";

export default function CandidateCard({ candidate, onClick }) {
    return (
        <div className="candidate-card" onClick={() => onClick?.(candidate)}>
            <div className="candidate-top">
                <img
                    src={candidate.avatar || "/images/avatar.png"}
                    alt="avatar"
                    className="avatar"
                />
                <div className="candidate-info">
                    <div className="name">{candidate.name}</div>
                    <div className="role">{candidate.role}</div>
                </div>
            </div>

            <div className="skills">
                {candidate.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                ))}
            </div>

            <button className="primary-small">
                Смотреть резюме
            </button>
        </div>
    );
}