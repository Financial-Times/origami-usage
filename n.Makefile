# ./node_modules/.bin on the PATH
export PATH := ./node_modules/.bin:$(PATH)

# Use bash not sh
SHELL := /bin/bash

# Some handy utilities
GLOB = git ls-files -z $1 | tr '\0' '\n' | xargs -I {} find {} ! -type l
NPM_INSTALL = npm prune --production=false && npm install
BOWER_INSTALL = bower prune && bower install --config.registry.search=http://registry.origami.ft.com --config.registry.search=https://bower.herokuapp.com
JSON_GET_VALUE = grep $1 | head -n 1 | sed 's/[," ]//g' | cut -d : -f 2
IS_GIT_IGNORED = grep -q $(if $1, $1, $@) .gitignore
VERSION = v1.4.33
APP_NAME = $(shell cat package.json 2>/dev/null | $(call JSON_GET_VALUE,name))
DONE = echo ✓ $@ done

#
# META TASKS
#

.PHONY: test

#
# COMMON TASKS
#

clea%: ## clean: Clean this git repository.
# HACK: Can't use -e option here because it's not supported by our Jenkins
	@git clean -fxd
	@$(DONE)

instal%: ## install: Setup this repository.
instal%: node_modules bower_components _install_scss_lint .editorconfig .eslintrc.js .scss-lint.yml .pa11yci.js webpack.config.js heroku-cli
	@$(MAKE) $(foreach f, $(shell find functions/* -type d -maxdepth 0 2>/dev/null), $f/node_modules $f/bower_components)
	@$(DONE)

deplo%: ## deploy: Deploy this repository.
deplo%: _deploy_apex
	@$(DONE)

verif%: ## verify: Verify this repository.
verif%: _verify_lintspaces _verify_eslint _verify_scss_lint _verify_pa11y_testable
	@$(DONE)

a11%: ## a11y: Check accessibility for this repository.
a11%: _run_pa11y
	@$(DONE)

asset%: ## assets: Build the static assets.
asset%: ## assets-production: Build the static assets for production.
	@if [ -e webpack.config.js ]; then webpack $(if $(findstring assets-production,$@),--bail,--dev); fi

buil%: ## build: Build this repository.
buil%: ## build-production: Build this repository for production.
buil%: public/__about.json
	@if [ -e webpack.config.js ]; then $(MAKE) $(subst build,assets,$@); fi
	@if [ -e Procfile ] && [ "$(findstring build-production,$@)" == "build-production" ]; then haikro build; fi
	@$(DONE)

watc%: ## watch: Watch for static asset changes.
	@if [ -e webpack.config.js ]; then webpack --watch --dev; fi
	@$(DONE)

#
# SUB-TASKS
#

# INSTALL SUB-TASKS

# Regular npm install
node_modules: package.json
	@if [ -e package.json ]; then $(NPM_INSTALL) && $(DONE); fi

# Regular bower install
bower_components: bower.json
	@if [ -e bower.json ]; then $(BOWER_INSTALL) && $(DONE); fi

# These tasks have been intentionally left blank
package.json:
bower.json:

# node_modules for Lambda functions
functions/%/node_modules:
	@cd $(dir $@) && if [ -e package.json ]; then $(NPM_INSTALL) && $(DONE); fi

# bower_components for Lambda functions
functions/%/bower_components:
	@cd $(dir $@) && if [ -e bower.json ]; then $(BOWER_INSTALL) && $(DONE); fi

_install_scss_lint:
	@if [ ! -x "$(shell which scss-lint)" ] && [ "$(shell $(call GLOB,'*.scss'))" != "" ]; then gem install scss-lint -v 0.35.0 && $(DONE); fi

# Manage various dot/config files if they're in the .gitignore
.editorconfig .eslintrc.js .scss-lint.yml webpack.config.js .pa11yci.js: n.Makefile
	@if $(call IS_GIT_IGNORED); then curl -sL https://raw.githubusercontent.com/Financial-Times/n-makefile/$(VERSION)/config/$@ > $@ && $(DONE); fi

MSG_HEROKU_CLI = "Please make sure the Heroku CLI toolbelt is installed - see https://toolbelt.heroku.com/. And make sure you are authenticated by running ‘heroku login’. If this is not an app, delete Procfile."
heroku-cli:
	@if [ -e Procfile ]; then heroku auth:whoami &>/dev/null || (echo $(MSG_HEROKU_CLI) && exit 1); fi

# VERIFY SUB-TASKS

_verify_eslint:
	@if [ -e .eslintrc.js ]; then $(call GLOB,'*.js') | xargs eslint && $(DONE); fi

_verify_lintspaces:
	@if [ -e .editorconfig ] && [ -e package.json ]; then $(call GLOB) | xargs lintspaces -e .editorconfig -i js-comments -i html-comments && $(DONE); fi

_verify_scss_lint:
# HACK: Use backticks rather than xargs because xargs swallow exit codes (everything becomes 1 and stoopidly scss-lint exits with 1 if warnings, 2 if errors)
	@if [ -e .scss-lint.yml ]; then { scss-lint -c ./.scss-lint.yml `$(call GLOB,'*.scss')`; if [ $$? -ne 0 -a $$? -ne 1 ]; then exit 1; fi; $(DONE); } fi

VERIFY_MSG_NO_DEMO = "Error: Components with templates must have a demo app, so that pa11y can test against it. This component doesn’t seem to have one. Add a demo app to continue peacefully. See n-image for an example."

_verify_pa11y_testable:
	@if [ ! -d server ] && [ -d templates ] && [ ! -f demos/app.js ]; then (echo $(VERIFY_MSG_NO_DEMO) && exit 1); fi
	@$(DONE)

_run_pa11y:
	echo $(CIRCLE_BRANCH)
ifneq ($(CIRCLE_BRANCH),)
	@export TEST_URL=http://${TEST_APP}.herokuapp.com; pa11y-ci;
else
	@export TEST_URL=http://local.ft.com:3002; pa11y-ci;
endif

# DEPLOY SUB-TASKS

npm-publis%: ## npm-publish: Publish this package to npm.
	npm-prepublish --verbose
	npm publish --access public

# BUILD SUB-TASKS

# Only apply to Heroku apps for now
public/__about.json:
	@if [ -e Procfile ]; then mkdir -p public && echo '{"description":"$(call APP_NAME)","support":"next.team@ft.com","supportStatus":"active","appVersion":"$(shell git rev-parse HEAD | xargs echo -n)","buildCompletionTime":"$(shell date -u +"%Y-%m-%dT%H:%M:%SZ")"}' > $@ && $(DONE); fi

hel%: ## help: Show this help message.
	@echo "usage: make [target] ..."
	@echo ""
	@echo "targets:"
	@grep -Eh '^.+:\ ##\ .+' ${MAKEFILE_LIST} | cut -d ' ' -f '3-' | column -t -s ':'
