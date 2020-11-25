detected_OS := $(shell sh -c 'uname 2>/dev/null || echo Unknown')

ifeq ($(detected_OS),Linux)

all: buildController buildView permissions rebuildNodeSass

buildController:
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; scl enable rh-nodejs10 'npm install'
	cd ../Fish/Common/Controller; npm run build

buildView:
	@echo "installing view dependencies"
	cd ../Fish/Common/Views/vue; scl enable rh-nodejs10 'npm install'

permissions:
	chmod +x ./xgui
	
rebuildNodeSass:
	@echo "rebuilding node sass"
	cd ../Fish/Common/Controller; scl enable rh-nodejs10 'npm rebuild node-sass'
	cd ../Fish/Common/Views/vue; scl enable rh-nodejs10 'npm rebuild node-sass'

endif

ifeq ($(detected_OS),Darwin)

all: buildController buildView permissions

buildController:
	@echo "makefile for MAC OS"  
	@echo "installing controller dependencies"  
	cd ../Fish/Common/Controller; npm install
	cd ../Fish/Common/Controller; npx tsc

buildView:
	@echo "installing view dependencies"
	cd ../Fish/Common/Views/vue; npm install

permissions:
	chmod +x ./xgui

endif
