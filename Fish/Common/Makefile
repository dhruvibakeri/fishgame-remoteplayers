all: build permissions  
build:  
	@echo "installing dependencies"  
	cd Controller; npm install
	cd Views/vue; npm install
permissions:
	chmod +x ./controller-test
	chmod +x ./view-run
	chmod +x ./view-test