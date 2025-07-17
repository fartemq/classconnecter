-- Удаляем все связанные записи для пользователя plushpepe11@gmail.com (ID: 24998516-55c9-437f-a4e1-4dbaa1ece769)

-- Удаляем записи из miro_boards
DELETE FROM public.miro_boards 
WHERE creator_id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем записи из tutor_schedule
DELETE FROM public.tutor_schedule 
WHERE tutor_id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем записи из tutor_subjects
DELETE FROM public.tutor_subjects 
WHERE tutor_id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем записи из tutor_profiles
DELETE FROM public.tutor_profiles 
WHERE id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем записи из profiles
DELETE FROM public.profiles 
WHERE id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем пользователя из auth.users
DELETE FROM auth.users 
WHERE id = '24998516-55c9-437f-a4e1-4dbaa1ece769';