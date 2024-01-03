/** @odoo-module */
import { registry } from '@web/core/registry';
import { useService } from "@web/core/utils/hooks";
const { xml, Component, onWillStart, onMounted } = owl;
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";

class OnedriveDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.rpc = this.env.services.rpc;
        onWillStart(this.onWillStart);
		onMounted(this.onMounted);
    }

    async onMounted() {
		
	}

    async onWillStart() {
        await this.synchronize();
    }

    synchronize() {
        var self = this;
            var response = jsonrpc("/onedrive/authentication_json").then(function(result) {
                if (!result) {
                    // Display a notification if access tokens are not set up
                    
                    self.action.doAction({
                        'type': 'ir.actions.client',
                        'tag': 'display_notification',
                        'params': {
                            'message': _t('Please setup credentials'),
                            'type': 'warning',
                            'sticky': false,
                        }
                    });
                }
                else if (result[0] === 'error') {
                    console.log(result);
                    if (result[1] === 'itemNotFound') {
                        // Display a notification if the folder is not found
                        self.action.doAction({
                            'type': 'ir.actions.client',
                            'tag': 'display_notification',
                            'params': {
                                'message': _t('Error: Folder not found.'),
                                'type': 'warning',
                                'sticky': false,
                            }
                        });
                    } else {
                        // Display a notification for other errors
                        self.action.doAction({
                            'type': 'ir.actions.client',
                            'tag': 'display_notification',
                            'params': {
                                'message': _t('Error:' + result[2]),
                                'type': 'warning',
                                'sticky': false,
                            }
                        });
                    }
                    
                } 
                else {
                    // Empty the onedrive_files div and append the files retrieved
                    self.$('#onedrive_files').empty();
                    var alt_src = "'/onedrive_integration_odoo/static/src/img/file_icon.png'";
                    $.each(Object.keys(result), function (index, name) {
                        self.$('#onedrive_files').append('<div class="col-sm-6 card" align="center"><a href="' + result[name] + '"><img class="card-img-top" src="' + result[name] + '" onerror="this.src=' + alt_src + ';"/></a>' + name + '</div>');
                    });
                }
            });
            
        }

        filter_file_type() {
            var value = ev.currentTarget.getAttribute('value');
            $.each(this.$('.card'), function (index, name) {
                $(this).hide();
                var file_type = (name.textContent).slice(((name.textContent).lastIndexOf(".") - 1 >>> 0) + 2);
                if (file_type == value) {
                    $(this).show();
                }
                if (value == 'allfiles') {
                    $(this).show();
                }
                if (value == 'image') {
                    if (file_type == 'jpeg' || file_type == 'jpg' || file_type == 'png') {
                        $(this).show();
                    }
                }
            });
        }

    upload() {
        this.action.doAction({
            name: "Upload File",
            type: 'ir.actions.act_window',
            res_model: 'upload.file',
            view_mode: 'form',
            view_type: 'form',
            views: [[false, 'form']],
            target: 'new',
        });
    }

    filter_file_type(ev) {
        // Your existing filter_file_type logic
        // ...
    }
}

OnedriveDashboard.template = xml`
<section class="dashboard_main_section" id="main_section_manager">
            <img src="/onedrive_integration_odoo/static/src/img/microsoft-onedrive.svg"
                 style="width:100px; margin-left: 10px;"/>
            <img src="/onedrive_integration_odoo/static/src/img/onedrive_name.svg"
                 style="width:150px; margin-left: 15px;"/>
            <input class="btn import" type="button" value="Import" id="import"/>
            <input class="btn upload" type="button" value="Upload" id="upload"/>
            <div class="row">
                <!--    filters view     -->
                <div class="left-sidebar">
                    <div class="files">
                        <div class="file-type" value="allfiles">
                            <img class="file-icon"
                                 src="onedrive_integration_odoo/static/src/img/file.png"/>
                        </div>
                        <div class="file-type"  value="image">
                            <img class="file-icon image"
                                 src="onedrive_integration_odoo/static/src/img/image.png"/>
                        </div>
                        <div class="file-type" value="pdf">
                            <img class="file-icon"
                                 src="onedrive_integration_odoo/static/src/img/pdf.png"/>
                        </div>
                        <div class="file-type" value="xlsx">
                            <img class="file-icon"
                                 src="onedrive_integration_odoo/static/src/img/excel.png"/>
                        </div>
                        <div class="file-type" value="zip">
                            <img class="file-icon"
                                 src="onedrive_integration_odoo/static/src/img/zip.png"/>
                        </div>
                        <div class="file-type" value="txt">
                            <img class="file-icon"
                                 src="onedrive_integration_odoo/static/src/img/txt.png"/>
                        </div>
                    </div>
                </div>
                <div class="col row onedrive_content"
                     id="onedrive_files"/>
            </div>
        </section>
`;
registry.category("actions").add("onedrive_dashboard", OnedriveDashboard);
