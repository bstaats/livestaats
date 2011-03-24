// ==========================================================================
// Project:   LiveStaats
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals LiveStaats */

LiveStaats = SC.Application.create();

jQuery(document).ready(function() {
  LiveStaats.mainPane = SC.TemplatePane.append({
    layerId: 'livestaats',
    templateName: 'livestaats'
  });
});
