include n.Makefile


# Environment variables
# ---------------------

EXPECTED_COVERAGE = 90


# Verify tasks
# ------------

verify-coverage:
	@nyc check-coverage --lines $(EXPECTED_COVERAGE) --functions $(EXPECTED_COVERAGE) --branches $(EXPECTED_COVERAGE)
	@$(DONE)


# Test tasks
# ----------

test: test-unit-coverage verify-coverage
	@$(DONE)

test-unit:
	@NODE_ENV=test mocha test/unit --recursive
	@$(DONE)

test-unit-coverage:
	@NODE_ENV=test nyc --reporter=text --reporter=html _mocha test/unit --recursive
	@$(DONE)


# Deploy tasks
# ------------

deploy:
	@git push git@git.heroku.com:origami-usage-qa.git
	@make change-request-qa
	@$(DONE)

promote:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@make update-cmdb
	@heroku pipelines:promote --app origami-usage-qa
	@make change-request-prod
	@$(DONE)

update-cmdb:
ifndef CMDB_API_KEY
	$(error CMDB_API_KEY is not set, cannot send updates to CMDB. You can find the key in LastPass)
endif
	@curl --silent --show-error -H 'Content-Type: application/json' -H 'x-api-key: ${CMDB_API_KEY}' -X PUT https://cmdb.in.ft.com/v3/items/endpoint/origami-usage-eu.herokuapp.com -d @operational-documentation/health-and-about-endpoints-eu.json -f > /dev/null
	@curl --silent --show-error -H 'Content-Type: application/json' -H 'x-api-key: ${CMDB_API_KEY}' -X PUT https://cmdb.in.ft.com/v3/items/system/origami-usage -d @operational-documentation/runbook.json -f > /dev/null


# Change Request tasks
# --------------------

CR_EMAIL=rowan.manning@ft.com
CR_APPNAME=Origami Usage
CR_DESCRIPTION=Release triggered by CI
CR_SERVICE_ID=Origami Usage
CR_NOTIFY_CHANNEL=origami-deploys

change-request-qa:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@release-log \
		--environment "Test" \
		--api-key "$(CR_API_KEY)" \
		--summary "Releasing $(CR_APPNAME) to QA" \
		--description "$(CR_DESCRIPTION)" \
		--owner-email "$(CR_EMAIL)" \
		--service "$(CR_SERVICE_ID)" \
		--notify-channel "$(CR_NOTIFY_CHANNEL)" \
		|| true
	@$(DONE)

change-request-prod:
ifndef CR_API_KEY
	$(error CR_API_KEY is not set, change requests cannot be created. You can find the key in LastPass)
endif
	@release-log \
		--environment "Production" \
		--api-key "$(CR_API_KEY)" \
		--summary "Releasing $(CR_APPNAME) to production" \
		--description "$(CR_DESCRIPTION)" \
		--owner-email "$(CR_EMAIL)" \
		--service "$(CR_SERVICE_ID)" \
		--notify-channel "$(CR_NOTIFY_CHANNEL)" \
		|| true
	@$(DONE)


# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon --ext html,js,json index.js
