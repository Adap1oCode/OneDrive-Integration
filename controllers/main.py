from odoo import http

class HttpController(http.Controller):

    @http.route("/get/res/partner", auth='public', type='json')
    def rpc_call(self, **kwargs):
        records = http.request.env['res.partner'].search_read([])

        return records
