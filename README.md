# Airdrop Manager

## Download and Run Offline

### Step 1: Download the Code

#### Finding the Root Directory
The root directory is the main folder of your project that contains all the files and subfolders. In Tempo, you can see it in the file explorer on the left side. It's the top-level folder that contains files like `package.json`, `index.html`, and folders like `src/`.

#### Option A: Using the Tempo UI
1. Look for the "Share" button in the top-right corner of the Tempo interface (it looks like a box with an arrow pointing up)
2. In the dropdown menu, click "Download as ZIP"
3. Extract the ZIP file to your preferred location

#### Option B: Using Git
1. Click on the Git tab in the left sidebar of Tempo
2. Connect your GitHub account if prompted
3. Create a new repository or connect to an existing one
4. Push your code to the repository
5. Clone the repository to your local machine using:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```

#### Option C: Using Terminal in Tempo
1. Open the terminal in Tempo (click the terminal icon in the bottom panel)
2. Make sure you're in the root directory by checking if you see files like package.json
3. Run the following command to create a compressed archive:
   ```bash
   # Install jszip-cli globally if not already installed
   npm install -g jszip-cli
   
   # Create zip file
   jszip -o project.zip -i "**/*" -x "**/node_modules/**" -x "**/.git/**" -x "**/dist/**"
   ```
4. Look for the download option that appears for the archive file

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up PostgreSQL (Optional)
1. Install PostgreSQL on your machine
2. Create a database named "airdrop_manager"
3. Update credentials in src/lib/postgres.ts if needed

### Step 4: Run the Application
```bash
# If you want to run both server and client
npm run start

# Or run just the client
npm run dev
```

This will start both the Express server and the React application.

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure
- `/src/components/dashboard`: Main UI components
- `/src/lib`: Database and utility functions
- `/src/types`: TypeScript type definitions

## Features
- Track cryptocurrency airdrops
- Manage project status
- Add notes to projects
- Filter and search projects
