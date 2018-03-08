<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "v_billing_advance_charges".
 *
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $category_id
 * @property string $category
 * @property string $headers
 * @property integer $charge
 * @property integer $visit_count
 * @property string $trans_mode
 * @property string $total_charge
 * @property integer $extra_amount
 * @property integer $concession_amount
 */
class VBillingAdvanceCharges extends \common\models\RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'v_billing_advance_charges';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'encounter_id', 'patient_id'], 'required'],
            [['tenant_id', 'encounter_id', 'patient_id', 'category_id', 'charge', 'visit_count', 'extra_amount', 'concession_amount'], 'integer'],
            [['total_charge'], 'number'],
            [['category'], 'string', 'max' => 14],
            [['headers'], 'string', 'max' => 20],
            [['trans_mode'], 'string', 'max' => 1],
            [['payment_date', 'card_type', 'card_number', 'bank_name', 'bank_number', 'bank_date'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'category_id' => 'Category ID',
            'category' => 'Category',
            'headers' => 'Headers',
            'charge' => 'Charge',
            'visit_count' => 'Visit Count',
            'trans_mode' => 'Trans Mode',
            'total_charge' => 'Total Charge',
            'extra_amount' => 'Extra Amount',
            'concession_amount' => 'Concession Amount',
        ];
    }

    public function fields() {
        $extend = [
            'total_charge_words' => function ($model) {
                if (isset($model->total_charge)) {
                    return Yii::$app->hepler->convert_number_to_words((int) $model->total_charge) . ' Rupees Only';
                } else {
                    return '-';
                }
            },
            'payment_date' => function ($model) {
                return isset($model->payment_date) ? date('d/m/Y', strtotime($model->payment_date)) : '';
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

}
