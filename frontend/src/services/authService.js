// Заглушка для работы с API. Позже замените на реальные запросы

// Имитация задержки сети
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Заглушка данных пользователей
const mockUsers = [
    {
        id: 1,
        email: "candidate@test.com",
        password: "123456",
        name: "Иван Иванов",
        role: "candidate",
        avatar: "/icons/user.svg"
    },
    {
        id: 2,
        email: "employer@test.com",
        password: "123456",
        name: "ООО Компания",
        role: "employer",
        company: "Компания",
        avatar: "/icons/company.svg"
    },
    {
        id: 3,
        email: "mentor@test.com",
        password: "123456",
        name: "Петр Петров",
        role: "curator",
        avatar: "/icons/mentor.svg"
    }
];

// Логин (заглушка)
export const loginUser = async (email, password, role) => {
    await delay(800); // Имитация загрузки

    // Поиск пользователя
    const user = mockUsers.find(
        u => u.email === email &&
            u.password === password &&
            u.role === role
    );

    if (!user) {
        throw new Error("Неверный email, пароль или роль");
    }

    // Не отправляем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    // Сохраняем токен (заглушка)
    const token = `mock_token_${user.id}_${Date.now()}`;
    localStorage.setItem("token", token);

    return { user: userWithoutPassword, token };
};

// Регистрация (заглушка)
export const registerUser = async (userData, role) => {
    await delay(800);

    // Проверка на существующего пользователя
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error("Пользователь с таким email уже существует");
    }

    // Создаем нового пользователя
    const newUser = {
        id: mockUsers.length + 1,
        email: userData.email,
        name: userData.name || userData.company,
        role: role,
        ...userData,
        password: undefined
    };

    // В реальном приложении здесь был бы запрос к серверу
    // mockUsers.push(newUser); // Не добавляем в mockUsers, т.к. это только для демо

    const token = `mock_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem("token", token);

    return { user: newUser, token };
};

// Выход
export const logoutUser = async () => {
    await delay(300);
    localStorage.removeItem("token");
};

// Получение текущего пользователя по токену
export const getCurrentUser = async () => {
    await delay(500);

    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    // В заглушке просто ищем пользователя по токену
    // В реальном приложении отправляли бы запрос с токеном
    const userId = token.split("_")[1];
    const user = mockUsers.find(u => u.id === parseInt(userId));

    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};