all: buildController buildView permissions  
buildController:  
	@echo "installing controller dependencies"  
	cd Common/Controller; npm install
buildView:  
	@echo "installing view dependencies"
	cd Common/Views/vue; npm install
permissions:
	chmod +x Common/view-run
	chmod +x ./xtest