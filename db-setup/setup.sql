-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'subadmin', 'player');
CREATE TYPE user_status AS ENUM ('active', 'blocked');
CREATE TYPE market_status AS ENUM ('open', 'closed');
CREATE TYPE game_type AS ENUM ('jodi', 'hurf', 'cross', 'odd_even');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bet', 'winning', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected');

-- Create Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'player',
  status user_status NOT NULL DEFAULT 'active',
  wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  subadmin_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_subadmin FOREIGN KEY (subadmin_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Create Markets table
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status market_status NOT NULL DEFAULT 'closed',
  banner_image TEXT,
  open_time TIMESTAMP,
  close_time TIMESTAMP,
  result VARCHAR(100),
  admin_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Game Types table
CREATE TABLE game_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type game_type NOT NULL,
  payout_ratio DECIMAL(8, 2) NOT NULL,
  min_bet_amount DECIMAL(10, 2) NOT NULL,
  max_bet_amount DECIMAL(10, 2) NOT NULL,
  admin_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create Market Games (junction table for many-to-many relationship)
CREATE TABLE market_games (
  id SERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  game_type_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_market FOREIGN KEY (market_id) REFERENCES markets (id) ON DELETE CASCADE,
  CONSTRAINT fk_game_type FOREIGN KEY (game_type_id) REFERENCES game_types (id) ON DELETE CASCADE,
  CONSTRAINT unique_market_game UNIQUE (market_id, game_type_id)
);

-- Create Bets table
CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  market_id INTEGER NOT NULL,
  game_type_id INTEGER NOT NULL,
  selected_number VARCHAR(20) NOT NULL,
  bet_amount DECIMAL(10, 2) NOT NULL,
  potential_winnings DECIMAL(12, 2) NOT NULL,
  status bet_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_market FOREIGN KEY (market_id) REFERENCES markets (id) ON DELETE CASCADE,
  CONSTRAINT fk_game_type FOREIGN KEY (game_type_id) REFERENCES game_types (id) ON DELETE CASCADE
);

-- Create Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT,
  status transaction_status NOT NULL DEFAULT 'pending',
  bet_id INTEGER,
  approver_id INTEGER,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bet FOREIGN KEY (bet_id) REFERENCES bets (id) ON DELETE SET NULL,
  CONSTRAINT fk_approver FOREIGN KEY (approver_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_subadmin ON users (subadmin_id);
CREATE INDEX idx_markets_status ON markets (status);
CREATE INDEX idx_markets_dates ON markets (open_time, close_time);
CREATE INDEX idx_bets_user ON bets (user_id);
CREATE INDEX idx_bets_market ON bets (market_id);
CREATE INDEX idx_bets_status ON bets (status);
CREATE INDEX idx_transactions_user ON transactions (user_id);
CREATE INDEX idx_transactions_status ON transactions (status);
CREATE INDEX idx_transactions_type ON transactions (type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_markets_modtime
    BEFORE UPDATE ON markets
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_game_types_modtime
    BEFORE UPDATE ON game_types
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_bets_modtime
    BEFORE UPDATE ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert test data for users
-- Admin user - password: admin123
INSERT INTO users (username, password, name, email, role, wallet_balance) 
VALUES ('admin', 'admin123', 'System Administrator', 'admin@satamatka.com', 'admin', 100000);

-- Subadmin users - password: subadmin123
INSERT INTO users (username, password, name, email, role, wallet_balance) 
VALUES ('subadmin1', 'subadmin123', 'Mumbai Manager', 'mumbai@satamatka.com', 'subadmin', 50000);

INSERT INTO users (username, password, name, email, role, wallet_balance) 
VALUES ('subadmin2', 'subadmin123', 'Kalyan Manager', 'kalyan@satamatka.com', 'subadmin', 50000);

-- Player users - password: player123
INSERT INTO users (username, password, name, email, phone, role, wallet_balance, subadmin_id) 
VALUES ('player1', 'player123', 'Raj Sharma', 'raj@example.com', '9876543210', 'player', 5000, 2);

INSERT INTO users (username, password, name, email, phone, role, wallet_balance, subadmin_id) 
VALUES ('player2', 'player123', 'Priya Patel', 'priya@example.com', '9876543211', 'player', 3000, 2);

INSERT INTO users (username, password, name, email, phone, role, wallet_balance, subadmin_id) 
VALUES ('player3', 'player123', 'Amit Kumar', 'amit@example.com', '9876543212', 'player', 2000, 3);

-- Insert test data for game types
INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Single Digit', 'Bet on a single digit (0-9)', 'jodi', 9.5, 10, 5000, 1);

INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Double Digit', 'Bet on a pair of digits (00-99)', 'jodi', 95, 10, 2000, 1);

INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Left Digit', 'Bet on the left digit position', 'hurf', 9.5, 10, 3000, 1);

INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Right Digit', 'Bet on the right digit position', 'hurf', 9.5, 10, 3000, 1);

INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Triple Panna', 'Bet on three digits in any order', 'cross', 150, 10, 1000, 1);

INSERT INTO game_types (name, description, type, payout_ratio, min_bet_amount, max_bet_amount, admin_id)
VALUES ('Odd/Even', 'Bet on whether the result will be odd or even', 'odd_even', 1.9, 20, 10000, 1);

-- Insert test data for markets
INSERT INTO markets (name, description, status, open_time, close_time, admin_id, banner_image)
VALUES ('Mumbai Main', 'The main market for Mumbai city', 'open', 
        NOW(), NOW() + INTERVAL '6 hours', 1, 
        'https://images.unsplash.com/photo-1566552881560-02559a566ab9?w=800&auto=format&fit=crop');

INSERT INTO markets (name, description, status, open_time, close_time, admin_id, banner_image)
VALUES ('Kalyan Day', 'Day market for Kalyan region', 'open', 
        NOW(), NOW() + INTERVAL '4 hours', 1,
        'https://images.unsplash.com/photo-1582638235564-4cae539c284c?w=800&auto=format&fit=crop');

INSERT INTO markets (name, description, status, open_time, close_time, result, admin_id, banner_image)
VALUES ('Time Bazar', 'Time Bazar special market', 'closed', 
        NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour', '42', 1,
        'https://images.unsplash.com/photo-1606567595334-d8a0128de287?w=800&auto=format&fit=crop');

-- Connect markets with game types
-- Mumbai Main games
INSERT INTO market_games (market_id, game_type_id) VALUES (1, 1);
INSERT INTO market_games (market_id, game_type_id) VALUES (1, 2);
INSERT INTO market_games (market_id, game_type_id) VALUES (1, 5);
INSERT INTO market_games (market_id, game_type_id) VALUES (1, 6);

-- Kalyan Day games
INSERT INTO market_games (market_id, game_type_id) VALUES (2, 1);
INSERT INTO market_games (market_id, game_type_id) VALUES (2, 2);
INSERT INTO market_games (market_id, game_type_id) VALUES (2, 3);
INSERT INTO market_games (market_id, game_type_id) VALUES (2, 4);

-- Time Bazar games
INSERT INTO market_games (market_id, game_type_id) VALUES (3, 2);
INSERT INTO market_games (market_id, game_type_id) VALUES (3, 5);
INSERT INTO market_games (market_id, game_type_id) VALUES (3, 6);

-- Insert sample bets
-- Player 1 bets
INSERT INTO bets (user_id, market_id, game_type_id, selected_number, bet_amount, potential_winnings, status)
VALUES (4, 1, 2, '42', 100, 9500, 'pending');

INSERT INTO bets (user_id, market_id, game_type_id, selected_number, bet_amount, potential_winnings, status)
VALUES (4, 2, 1, '7', 50, 475, 'pending');

-- Player 2 bets
INSERT INTO bets (user_id, market_id, game_type_id, selected_number, bet_amount, potential_winnings, status)
VALUES (5, 1, 6, 'odd', 200, 380, 'pending');

-- Player 3 bets
INSERT INTO bets (user_id, market_id, game_type_id, selected_number, bet_amount, potential_winnings, status)
VALUES (6, 3, 2, '42', 100, 9500, 'won');

INSERT INTO bets (user_id, market_id, game_type_id, selected_number, bet_amount, potential_winnings, status)
VALUES (6, 3, 6, 'even', 150, 285, 'lost');

-- Insert sample transactions
-- Deposits
INSERT INTO transactions (user_id, amount, type, description, status, approver_id)
VALUES (4, 5000, 'deposit', 'Initial deposit', 'approved', 1);

INSERT INTO transactions (user_id, amount, type, description, status, approver_id)
VALUES (5, 3000, 'deposit', 'Initial deposit', 'approved', 1);

INSERT INTO transactions (user_id, amount, type, description, status, approver_id)
VALUES (6, 2000, 'deposit', 'Initial deposit', 'approved', 1);

-- Pending withdrawal
INSERT INTO transactions (user_id, amount, type, description, status)
VALUES (4, 1000, 'withdrawal', 'Withdrawal request', 'pending');

-- Bet transactions
INSERT INTO transactions (user_id, amount, type, description, status, bet_id)
VALUES (4, -100, 'bet', 'Bet on Mumbai Main market', 'approved', 1);

INSERT INTO transactions (user_id, amount, type, description, status, bet_id)
VALUES (4, -50, 'bet', 'Bet on Kalyan Day market', 'approved', 2);

INSERT INTO transactions (user_id, amount, type, description, status, bet_id)
VALUES (5, -200, 'bet', 'Bet on Mumbai Main market', 'approved', 3);

INSERT INTO transactions (user_id, amount, type, description, status, bet_id)
VALUES (6, -100, 'bet', 'Bet on Time Bazar market', 'approved', 4);

INSERT INTO transactions (user_id, amount, type, description, status, bet_id)
VALUES (6, -150, 'bet', 'Bet on Time Bazar market', 'approved', 5);

-- Winning transaction
INSERT INTO transactions (user_id, amount, type, description, status, bet_id, approver_id)
VALUES (6, 9500, 'winning', 'Won bet on Time Bazar market', 'approved', 4, 1);
