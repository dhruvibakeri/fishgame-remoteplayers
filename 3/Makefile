all: buildController permissions
buildController:  
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; npm install
	cd ../Fish/Common/Controller; npx tsc
permissions:
	chmod +x ./xboard