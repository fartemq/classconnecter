
import { Student } from "@/types/student";

// Converted to match our Student type
export const mockStudents: Student[] = [
  {
    id: "1",
    first_name: "Алексей",
    last_name: "Петров",
    avatar_url: "https://randomuser.me/api/portraits/men/1.jpg",
    city: "Москва",
    name: "Алексей Петров",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    lastActive: "Сегодня",
    level: "Школьник",
    grade: "10",
    subjects: ["Математика", "Физика"],
    about: "Готовлюсь к ЕГЭ, нужна помощь с задачами по физике и углубленной математике",
    interests: ["Программирование", "Робототехника"],
    status: "active"
  },
  {
    id: "2",
    first_name: "Мария",
    last_name: "Иванова",
    avatar_url: "https://randomuser.me/api/portraits/women/2.jpg",
    city: "Санкт-Петербург",
    name: "Мария Иванова",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    lastActive: "Вчера",
    level: "Студент",
    grade: "",
    subjects: ["Английский язык", "Немецкий язык"],
    about: "Изучаю иностранные языки в университете, нужна практика разговорной речи",
    interests: ["Путешествия", "Литература"],
    status: "active"
  },
  {
    id: "3",
    first_name: "Дмитрий",
    last_name: "Сидоров",
    avatar_url: "https://randomuser.me/api/portraits/men/3.jpg",
    city: "Казань",
    name: "Дмитрий Сидоров",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    lastActive: "3 дня назад",
    level: "Школьник",
    grade: "8",
    subjects: ["История", "Обществознание"],
    about: "Интересуюсь историей, хочу участвовать в олимпиадах",
    interests: ["Археология", "Политика"],
    status: "active"
  },
  {
    id: "4",
    first_name: "Екатерина",
    last_name: "Смирнова",
    avatar_url: "https://randomuser.me/api/portraits/women/4.jpg",
    city: "Новосибирск",
    name: "Екатерина Смирнова",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    lastActive: "Неделю назад",
    level: "Взрослый",
    grade: "",
    subjects: ["Программирование", "Веб-дизайн"],
    about: "Меняю профессию, учусь программировать",
    interests: ["Дизайн", "Технологии"],
    status: "active"
  }
];
