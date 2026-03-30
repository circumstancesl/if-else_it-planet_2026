import "./RoleOption.css";

export default function RoleOption({ title, subtitle, selected, onClick, role }) {
    const getIcon = () => {
        switch(role) {
            case "jobseeker":
                return "/img/jobseeker.jpg";
            case "employer":
                return "/img/employer.jpg";
            case "curator":
                return "/img/mentor.jpg";
            default:
                return "/img/default.jpg";
        }
    };

    return (
        <div
            className={`role-option ${selected ? "selected" : ""}`}
            onClick={onClick}
        >
            <div className="icon">
                <img
                    src={getIcon()} 
                    alt={title}
                />
            </div>
            <div>
                <div className="title">{title}</div>
                <div className="subtitle">{subtitle}</div>
            </div>
        </div>
    );
}