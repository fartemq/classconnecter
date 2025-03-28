
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Categories of subjects with their subjects
const subjectCategories = [
  {
    name: "Точные науки",
    subjects: [
      { name: "Математика", slug: "mathematics" },
      { name: "Физика", slug: "physics" },
      { name: "Химия", slug: "chemistry" },
      { name: "Информатика", slug: "computer-science" },
      { name: "Статистика", slug: "statistics" },
    ]
  },
  {
    name: "Гуманитарные науки",
    subjects: [
      { name: "История", slug: "history" },
      { name: "Литература", slug: "literature" },
      { name: "Философия", slug: "philosophy" },
      { name: "Психология", slug: "psychology" },
      { name: "Социология", slug: "sociology" },
    ]
  },
  {
    name: "Языки",
    subjects: [
      { name: "Английский", slug: "english" },
      { name: "Русский", slug: "russian" },
      { name: "Немецкий", slug: "german" },
      { name: "Французский", slug: "french" },
      { name: "Испанский", slug: "spanish" },
      { name: "Китайский", slug: "chinese" },
    ]
  },
  {
    name: "Искусство и музыка",
    subjects: [
      { name: "Музыка", slug: "music" },
      { name: "Рисование", slug: "drawing" },
      { name: "Живопись", slug: "painting" },
      { name: "История искусства", slug: "art-history" },
      { name: "Фотография", slug: "photography" },
    ]
  }
];

const SubjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(activeCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-6">Все предметы</h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Выберите интересующий вас предмет, чтобы найти лучших репетиторов, 
            которые помогут вам достичь ваших учебных целей
          </p>
          
          {/* Category buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="min-w-32"
            >
              Все категории
            </Button>
            {subjectCategories.map((category) => (
              <Button 
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                onClick={() => handleCategoryClick(category.name)}
                className="min-w-32"
              >
                {category.name}
              </Button>
            ))}
          </div>
          
          {/* Subjects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectCategories
              .filter(category => activeCategory === null || category.name === activeCategory)
              .map((category) => (
                <div key={category.name} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
                  <ul className="space-y-2">
                    {category.subjects.map((subject) => (
                      <li key={subject.slug}>
                        <Link 
                          to={`/tutors?subject=${subject.slug}`}
                          className="text-primary hover:text-primary-dark hover:underline"
                        >
                          {subject.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubjectsPage;
