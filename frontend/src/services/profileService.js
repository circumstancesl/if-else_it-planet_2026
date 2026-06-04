import { getCurrentUser } from "./authService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Заглушка данных профилей для разных ролей
const mockProfiles = {
    candidate: {
        id: 1,
        name: "Иван Иванов",
        email: "candidate@test.com",
        role: "candidate",
        skills: ["React", "JavaScript", "CSS", "TypeScript"],
        experience: "3 года",
        education: "МГУ, прикладная математика",
        resume: "/resumes/ivanov.pdf",
        avatar: "/icons/user.svg"
    },
    employer: {
        id: 2,
        company: "ООО Компания",
        email: "employer@test.com",
        role: "employer",
        website: "https://company.ru",
        description: "Мы занимаемся разработкой ПО",
        employees: "50-100",
        location: "Москва",
        avatar: "/icons/company.svg"
    },
    mentor: {
        id: 3,
        name: "Петр Петров",
        email: "mentor@test.com",
        role: "curator",
        skills: ["React", "Node.js", "Python"],
        experience: "10 лет",
        students: ["Иван Иванов", "Анна Смирнова"],
        avatar: "/icons/mentor.svg"
    }
};

// Получение профиля текущего пользователя
export const getProfile = async () => {
    await delay(500);

    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Не авторизован");
    }

    // Получаем текущего пользователя
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("Пользователь не найден");
    }

    // Возвращаем профиль в зависимости от роли
    const profile = mockProfiles[currentUser.role];
    if (!profile) {
        throw new Error("Профиль не найден");
    }

    return profile;
};

// Обновление профиля
export const updateProfile = async (data) => {
    await delay(800);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error("Не авторизован");
    }

    // В реальном приложении здесь был бы PUT запрос
    // Сейчас просто имитируем успешное обновление
    const updatedProfile = {
        ...mockProfiles[currentUser.role],
        ...data
    };

    // Сохраняем в localStorage для сохранения между перезагрузками
    localStorage.setItem(`profile_${currentUser.role}`, JSON.stringify(updatedProfile));

    return updatedProfile;
};