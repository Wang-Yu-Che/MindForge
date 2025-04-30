CREATE TABLE punch_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  punch_date DATE NOT NULL,
  UNIQUE (user_id, punch_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
