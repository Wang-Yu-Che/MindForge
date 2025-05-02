CREATE TABLE `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,   -- 日程ID
  `user_id` INT NOT NULL,                -- 用户ID
  `date` DATE NOT NULL,                  -- 日程日期
  `schedule` TEXT NOT NULL               -- 日程内容
);
