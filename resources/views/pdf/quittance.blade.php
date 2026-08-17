<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Quittance de loyer</title>

<style>
body{
    font-family: DejaVu Sans, sans-serif;
    color:#222;
    font-size:13px;
    line-height:1.6;
}

.header{
    border-bottom:3px solid #0B2A4A;
    padding-bottom:15px;
    margin-bottom:25px;
}

.logo{
    width:90px;
}

.title{
    color:#0B2A4A;
    font-size:26px;
    font-weight:bold;
    margin-top:10px;
}

.subtitle{
    color:#B08D57;
    font-size:14px;
}

.numero{
    float:right;
    text-align:right;
    font-size:12px;
}

.section{
    margin-top:20px;
}

.box{
    border:1px solid #DDD;
    padding:15px;
    border-radius:6px;
    margin-top:10px;
}

table{
    width:100%;
    border-collapse:collapse;
}

td{
    padding:8px;
}

.label{
    width:35%;
    font-weight:bold;
    color:#555;
}

.amount{
    font-size:22px;
    color:#0B2A4A;
    font-weight:bold;
}

.footer{
    margin-top:60px;
}

.signature{
    width:45%;
    text-align:center;
    float:right;
}

.note{
    margin-top:60px;
    font-size:11px;
    color:#777;
    text-align:center;
}

.badge{
    background:#0B2A4A;
    color:white;
    padding:6px 12px;
    display:inline-block;
    border-radius:4px;
}
</style>

</head>
<body>

<div class="header">

<table width="100%">
<tr>

<td width="20%">
<img src="{{ public_path('images/logo.png') }}" class="logo">
</td>

<td width="55%">

<div class="title">
Cabinet d'Huissiers de Justice
</div>

<div class="subtitle">
Quittance officielle de paiement de loyer
</div>

</td>

<td width="25%" class="numero">

<strong>N°</strong><br>

{{ $quittance->numero }}

<br><br>

{{ $quittance->date_quittance->format('d/m/Y') }}

</td>

</tr>
</table>

</div>

<div style="text-align:center;margin-bottom:25px;">

<span class="badge">

QUITTANCE DE LOYER

</span>

</div>

<div class="box">

<table>

<tr>

<td class="label">
Locataire
</td>

<td>
{{ $quittance->bail->locataire->nom }}
</td>

</tr>

<tr>

<td class="label">
Bailleur
</td>

<td>
{{ $quittance->bail->bailleur->nom }}
</td>

</tr>

<tr>

<td class="label">
Adresse du bien
</td>

<td>
{{ $quittance->bail->adresse_bien }}
</td>

</tr>

<tr>

<td class="label">
Mois concerné
</td>

<td>
{{ $quittance->mois }}
</td>

</tr>

<tr>

<td class="label">
Mode de paiement
</td>

<td>
{{ $quittance->paiement->mode_paiement_label }}
</td>

</tr>

<tr>

<td class="label">
Référence du bail
</td>

<td>
{{ $quittance->bail->reference }}
</td>

</tr>

</table>

</div>

<div class="section">

Le cabinet reconnaît avoir reçu du locataire la somme de :

<div style="margin-top:20px;" class="amount">

{{ number_format($quittance->montant,0,',',' ') }} FCFA

</div>

au titre du paiement du loyer correspondant au mois de

<strong>{{ $quittance->mois }}</strong>.

</div>

<div class="footer">

<div class="signature">

Fait le

{{ $quittance->date_quittance->format('d/m/Y') }}

<br><br><br><br>

_____________________________

<br>

Signature et cachet

</div>

</div>

<div style="clear:both;"></div>

<div class="note">

Cette quittance certifie que le paiement du loyer a été intégralement reçu par le cabinet.

</div>

</body>
</html>