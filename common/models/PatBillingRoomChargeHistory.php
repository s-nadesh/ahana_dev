<?php

namespace common\models;

use common\models\query\PatBillingRoomChargeHistoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_billing_room_charge_history".
 *
 * @property integer $charge_hist_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $from_date
 * @property string $to_date
 * @property integer $charge_item_id
 * @property integer $room_type_id
 * @property string $charge
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoRoomChargeItem $chargeItem
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoRoomType $roomType
 * @property CoTenant $tenant
 */
class PatBillingRoomChargeHistory extends RActiveRecord
{
    public $org_to_date;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pat_billing_room_charge_history';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['encounter_id', 'patient_id', 'from_date', 'charge_item_id', 'room_type_id', 'charge'], 'required'],
            [['tenant_id', 'encounter_id', 'patient_id', 'charge_item_id', 'room_type_id', 'created_by', 'modified_by'], 'integer'],
            [['from_date', 'to_date', 'created_at', 'modified_at', 'deleted_at', 'org_to_date'], 'safe'],
            [['charge'], 'number'],
            [['status'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'charge_hist_id' => 'Charge Hist ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'from_date' => 'From Date',
            'to_date' => 'To Date',
            'charge_item_id' => 'Charge Item ID',
            'room_type_id' => 'Room Type ID',
            'charge' => 'Charge',
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
    public function getChargeItem()
    {
        return $this->hasOne(CoRoomChargeItem::className(), ['charge_item_id' => 'charge_item_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter()
    {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient()
    {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRoomType()
    {
        return $this->hasOne(CoRoomType::className(), ['room_type_id' => 'room_type_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant()
    {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public function afterFind() {
        $this->org_to_date = ((empty($this->to_date) || $this->to_date == '0000-00-00 00:00:00') ? date('Y-m-d') : $this->to_date);
        
        return parent::afterFind();
    }
    
    public static function find() {
        return new PatBillingRoomChargeHistoryQuery(get_called_class());
    }
    
    public function fields() {
        $extend = [
            'charge_item' => function ($model) {
                return (isset($model->chargeItem) ? $model->chargeItem->charge_item_name : '-');
            },
            'room_type' => function ($model) {
                return (isset($model->roomType) ? $model->roomType->room_type_name : '-');
            },
            'org_to_date' => function ($model) {
                return ((empty($model->to_date) || $model->to_date == '0000-00-00 00:00:00') ? date('Y-m-d') : $model->to_date);
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
}
