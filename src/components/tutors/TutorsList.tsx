
import { Tutor } from "@/pages/TutorsPage";
import { TutorCard } from "./TutorCard";

interface TutorsListProps {
  tutors: Tutor[];
}

export function TutorsList({ tutors }: TutorsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tutors.map((tutor) => (
        <TutorCard key={tutor.id} tutor={tutor} />
      ))}
    </div>
  );
}
