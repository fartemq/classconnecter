
import { Student } from "@/types/student";

// Mock data for student profiles
export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Мария Иванова",
    avatar: null,
    lastActive: "2 часа назад",
    level: "Школьник",
    grade: "10 класс",
    school: "Школа №123",
    subjects: ["Математика", "Физика"],
    city: "Москва",
    about: "Готовлюсь к ЕГЭ, нужна помощь с задачами повышенной сложности.",
    interests: ["Олимпиады", "Подготовка к ЕГЭ"],
    status: "new"
  },
  {
    id: "2",
    name: "Алексей Смирнов",
    avatar: null,
    lastActive: "Вчера",
    level: "Студент",
    grade: "2 курс",
    school: "Московский Государственный Университет",
    subjects: ["Высшая математика", "Программирование"],
    city: "Санкт-Петербург",
    about: "Нужна помощь с линейной алгеброй и аналитической геометрией.",
    interests: ["Углубленное изучение"],
    status: "active"
  },
  {
    id: "3",
    name: "Екатерина Петрова",
    avatar: null,
    lastActive: "Онлайн",
    level: "Взрослый",
    grade: null,
    school: null,
    subjects: ["Английский язык"],
    city: "Нижний Новгород",
    about: "Хочу подтянуть разговорный английский для работы.",
    interests: ["Разговорная практика", "Бизнес-английский"],
    status: "active"
  },
  {
    id: "4",
    name: "Дмитрий Козлов",
    avatar: null,
    lastActive: "3 дня назад",
    level: "Школьник",
    grade: "8 класс",
    school: "Гимназия №45",
    subjects: ["Русский язык", "Литература"],
    city: "Казань",
    about: "Трудности с сочинениями и анализом текста.",
    interests: ["Подготовка к экзаменам"],
    status: "inactive"
  }
];
