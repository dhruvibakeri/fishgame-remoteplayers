all: buildController permissions
buildController:  
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; npm install
	cd ../Fish/Common/Controller; npx tsc
	@echo "installing server/client dependencies"
	cd ../Fish/Remote; npm install
	cd ../Fish/Remote; npx tsc
permissions:
	chmod +x ./xserver
	chmod +x ./xclients
