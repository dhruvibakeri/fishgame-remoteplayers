all: buildController buildView permissions
buildController:  
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; npm install
buildView:  
	@echo "installing view dependencies"
	cd ../Fish/Common/Views/vue; npm install
permissions:
	chmod +x Common/view-run
	chmod +x ./xtest
	chmod +x Tests/xboard  