# ===========================================================================
# Project:   LiveStaats
# Copyright: ©2011 My Company, Inc.
# ===========================================================================

# Add initial buildfile information here
config :livestaats,
  :required => "sproutcore/core_foundation",
  :theme => "sproutcore/empty_theme"

proxy '/livestaats', :to => 'localhost:8081', :protocol => 'http'