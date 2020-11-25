all: buildController permissions
buildController:  
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; npm install
	cd ../Fish/Common/Controller; npx tsc
buildView:
	@echo "installing view dependencies"
	cd ../Fish/Common/Views/vue; npm install
permissions:
	chmod +x ./xgui
