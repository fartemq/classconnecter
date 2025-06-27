
-- Удаляем пользователя crokodilob@gmail.com
-- Сначала находим его ID по email из auth.users и удаляем связанные данные
DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

DELETE FROM public.student_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

DELETE FROM public.tutor_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

-- Удаляем связанные данные для crokodilob@gmail.com
DELETE FROM public.lessons WHERE tutor_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
) OR student_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

DELETE FROM public.homework WHERE tutor_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
) OR student_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

DELETE FROM public.messages WHERE sender_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
) OR receiver_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

DELETE FROM public.notifications WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'crokodilob@gmail.com'
);

-- Удаляем пользователя plushpepe11@gmail.com
-- Сначала находим его ID по email из auth.users и удаляем связанные данные
DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

DELETE FROM public.student_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

DELETE FROM public.tutor_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

-- Удаляем связанные данные для plushpepe11@gmail.com
DELETE FROM public.lessons WHERE tutor_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
) OR student_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

DELETE FROM public.homework WHERE tutor_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
) OR student_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

DELETE FROM public.messages WHERE sender_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
) OR receiver_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

DELETE FROM public.notifications WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'plushpepe11@gmail.com'
);

-- Удаляем записи из Google Meet sessions, которые могут блокировать удаление
DELETE FROM public.google_meet_sessions WHERE organizer_id IN (
  SELECT id FROM auth.users WHERE email IN ('crokodilob@gmail.com', 'plushpepe11@gmail.com')
);
