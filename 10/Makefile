all: buildController permissions
buildController:  
	@echo "installing server/client dependencies"
	cd ../Fish/Remote; scl enable rh-nodejs10 'npm install'
	cd ../Fish/Remote; scl enable rh-nodejs10 'npm run build'
permissions:
	chmod +x ./xserver
	chmod +x ./xclients
