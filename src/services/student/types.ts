
import { TutorBasicInfo } from "../tutor/types";

export interface StudentTutorRelationship {
  id: string;
  student_id: string;
  tutor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'removed';
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  tutor?: TutorBasicInfo;
}

export interface FavoriteTutor {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
  tutor?: TutorBasicInfo;
}

export interface TutorReviewData {
  student_id: string;
  tutor_id: string;
  rating: number;
  comment: string;
}
