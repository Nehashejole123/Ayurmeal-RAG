# if redis not found - disable the vpn 
(docker start redis-stack )-run this in vs code terminal

# How to Run 

1) install all dependencies 
pip install -r requirements.txt /run in backend folder

2) activate the virtual enviornment
conda activate venv/

# BACKEND
- cd backend 
- python main.py

# FRONTEND
- cd frontend
- npm run dev 

# Run Advance and aesthetic UI 
 
 * NOTE : Make sure you have node installed in your pc check through(bash) : node -v
    if not then download by (bash) : npm -v

1) Change The Directory to FRONTEND

2) install all dependencies by : 
    run -> npm install

 * Description : This command reads the package.json file, downloads all required packages, and places them in the node_modules folder. 

3) If your frontend folder does not have folder named dist then run this command : 
    npm run build

