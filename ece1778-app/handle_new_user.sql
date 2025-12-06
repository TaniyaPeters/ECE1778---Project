begin
  insert into public.profiles (id, full_name, avatar_url, email, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email,
    (case when (new.raw_user_meta_data->>'iss' is null) then new.raw_user_meta_data->>'username'
          when (new.raw_user_meta_data->>'iss' = 'https://api.github.com') then new.raw_user_meta_data->>'user_name'
          when (new.raw_user_meta_data->>'iss' = 'https://discord.com/api') then new.raw_user_meta_data->>'full_name'
          else new.raw_user_meta_data->>'username' END));
  
  -- Create "Watched" collection for the new user
  insert into public.collections (name, user_id, movie_list, book_list)
  values ('Watched', new.id, '[]', null::jsonb);
  
  -- Create "Read" collection for the new user
  insert into public.collections (name, user_id, movie_list, book_list)
  values ('Read', new.id, null, '[]'::jsonb);
  
  return new;
end;