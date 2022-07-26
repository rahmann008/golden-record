#! /bin/sh

#BACKEND
sudo apt update
echo "Installing Python3 and Pip3"
sudo apt install python3 -y
sudo apt install python3-pip -y
echo "Installing Required modules/packages in requirements.txt"
sudo pip3 install -r ./backend/requirements.txt
echo "requirements installed"
echo "starting python on background"
nohup python3 ./backend/app.py >/dev/null 2>&1 &

#FRONTEND
sudo apt install nginx -y
echo "nginx installed"
sudo apt install expect -y
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install nodejs -y
echo "nodejs installed"
sudo npm install -g @angular/cli@latest
sudo apt install npm -y
sudo npm install npm@latest
echo "npm installed"
cd UI/
sudo npm install
sudo npm install d3
sudo chmod +x  script.exp ng-angular-materials.sh
sudo ./script.exp
echo "building the packages (frontend)"
sudo ng build
echo "build is successfull"
sudo mkdir -p /var/www/html
sudo cp -r dist/GoldenRecords/* /var/www/html/
echo "copied the dist folder"
sudo systemctl restart nginx.service
echo "nginx service restarted"
