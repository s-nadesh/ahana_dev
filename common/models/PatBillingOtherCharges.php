<?php

namespace common\models;

use common\models\query\PatBillingOtherChargesQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_billing_other_charges".
 *
 * @property integer $other_charge_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $charge_cat_id
 * @property integer $charge_subcat_id
 * @property string $charge_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoRoomChargeSubcategory $chargeSubcat
 * @property CoRoomChargeCategory $chargeCat
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatBillingOtherCharges extends RActiveRecord {

    public $charge_category;
    public $charge_sub_category;
    public $branch_name;
    public $total_charge_amount;
    public $total_visit;
    public $untill_discharge;
    public $next;
    public $no_of_days;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_billing_other_charges';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['charge_cat_id', 'charge_subcat_id', 'charge_cat_id', 'charge_amount'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'charge_cat_id', 'charge_subcat_id', 'created_by', 'modified_by'], 'integer'],
                [['charge_amount'], 'number'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'untill_discharge', 'next', 'no_of_days'], 'safe'],
                //[['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'encounter_id', 'patient_id', 'charge_cat_id', 'charge_subcat_id', 'deleted_at'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'other_charge_id' => 'Other Charge ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'charge_cat_id' => 'Charge Cat ID',
            'charge_subcat_id' => 'Charge Type',
            'charge_amount' => 'Charge Amount',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getChargeSubcat() {
        return $this->hasOne(CoRoomChargeSubcategory::className(), ['charge_subcat_id' => 'charge_subcat_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getChargeCat() {
        return $this->hasOne(CoRoomChargeCategory::className(), ['charge_cat_id' => 'charge_cat_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    public function getAdmission() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatBillingOtherChargesQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'patient_name' => function ($model) {
                return isset($model->patient) ? $model->patient->fullname : '-';
            },
            'patient_UHID' => function ($model) {
                return isset($model->patient) ? $model->patient->patient_global_int_code : '-';
            },
            'charge_category' => function ($model) {
                return isset($model->chargeCat) ? $model->chargeCat->charge_cat_name : '-';
            },
            'sub_category' => function ($model) {
                return isset($model->chargeSubcat) ? $model->chargeSubcat->charge_subcat_name : '-';
            },
            'tenant_name' => function ($model) {
                return isset($this->tenant) ? $this->tenant->tenant_name : '-';
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            if (($this->untill_discharge) || ($this->next)) {
                $schedule_charge = new PatScheduleCharge();
                if ($this->untill_discharge) {
                    $schedule_charge->until_discharge = 1;
                } else {
                    $schedule_charge->no_of_days = $this->no_of_days;
                    $schedule_charge->until_date = date('Y-m-d', strtotime(' + ' . $this->no_of_days . ' days'));
                }
                $schedule_charge->cron_status = 1;
                $schedule_charge->other_charge_id = $this->other_charge_id;
                $schedule_charge->tenant_id = $this->tenant_id;
                $schedule_charge->encounter_id = $this->encounter_id;
                $schedule_charge->patient_id = $this->patient_id;
                $schedule_charge->save();
            }
            $activity = 'Other Charges Added Successfully (#' . $this->encounter_id . ' )';
        } else
            $activity = 'Other Charges Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatBillingOtherCharges::tableName(), $this->other_charge_id, $activity, $this->tenant_id, $this->created_by, 'patient.addOtherCharge');
    }

}
