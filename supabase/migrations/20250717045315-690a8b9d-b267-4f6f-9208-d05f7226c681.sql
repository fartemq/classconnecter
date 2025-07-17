-- Удаляем записи из miro_boards для пользователя plushpepe11@gmail.com
DELETE FROM public.miro_boards 
WHERE creator_id = '24998516-55c9-437f-a4e1-4dbaa1ece769';

-- Удаляем пользователя из auth.users
DELETE FROM auth.users 
WHERE id = '24998516-55c9-437f-a4e1-4dbaa1ece769';