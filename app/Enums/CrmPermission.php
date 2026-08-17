<?php

namespace App\Enums;

enum CrmPermission: string
{
    case CRM_DASHBOARD = 'crm.dashboard';
    case CRM_CLIENTS = 'crm.clients';
    case CRM_DOSSIERS = 'crm.dossiers';
    case CRM_ACTES = 'crm.actes';
    case CRM_DOCUMENTS = 'crm.documents';
    case CRM_ECHEANCES = 'crm.echeances';
    case CRM_BAUX = 'crm.baux';
    case CRM_LOYERS = 'crm.loyers';
    case CRM_PAIEMENTS = 'crm.paiements';
    case CRM_QUITTANCES = 'crm.quittances';
    case CRM_FACTURES = 'crm.factures';
    case CRM_TRANSMISSIONS = 'crm.transmissions';
    case CRM_ARCHIVES = 'crm.archives';
    case CRM_LOGS = 'crm.logs';
    case CRM_STATISTIQUES = 'crm.statistiques';
    case CRM_UTILISATEURS = 'crm.utilisateurs';
    case CRM_NOTIFICATIONS = 'crm.notifications';
    case CRM_CLIENT_DASHBOARD = 'crm.client.dashboard';
    case CRM_USERS_DELETE = 'crm.users.delete';
}
