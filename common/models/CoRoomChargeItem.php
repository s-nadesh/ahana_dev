<?php

namespace common\models;

use common\models\query\CoRoomChargeItemQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_room_charge_item".
 *
 * @property integer $charge_item_id
 * @property integer $tenant_id
 * @property string $charge_item_name
 * @property string $charge_item_code
 * @property string $charge_item_description
 * @property integer $charge_cat_id
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property CoRoomChargeCategory $chargeCat
 */
class CoRoomChargeItem extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'co_room_charge_item';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['charge_item_name'], 'required'],
            [['tenant_id', 'created_by', 'modified_by'], 'integer'],
            [['charge_item_description', 'status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['charge_item_name'], 'string', 'max' => 50],
            [['charge_item_code'], 'string', 'max' => 10],
            [['tenant_id'], 'unique', 'targetAttribute' => ['charge_item_name', 'tenant_id', 'deleted_at'], 'message' => 'The combination has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'charge_item_id' => 'Charge Item ID',
            'tenant_id' => 'Tenant ID',
            'charge_item_name' => 'Charge Item Name',
            'charge_item_code' => 'Charge Item Code',
            'charge_item_description' => 'Charge Item Description',
            'charge_cat_id' => 'Charge Category',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant()
    {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
//    public function getChargeCat()
//    {
//        return $this->hasOne(CoRoomChargeCategory::className(), ['charge_cat_id' => 'charge_cat_id']);
//    }
    
    public static function find() {
        return new CoRoomChargeItemQuery(get_called_class());
    }
    
//    public function fields() {
//        $extend = [
//            'charge_cat_name' => function ($model) {
//                return (isset($model->chargeCat) ? $model->chargeCat->charge_cat_name : '-');
//            },
//        ];
//        $fields = array_merge(parent::fields(), $extend);
//        return $fields;
//    }
    
    public static function getRoomChargeItemlist($tenant = null, $status = '1', $deleted = false) {
        if(!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();
        
        return $list;
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Room Charge Item Added Successfully (#' . $this->charge_item_name . ' )';
        else
            $activity = 'Room Charge Item Updated Successfully (#' . $this->charge_item_name . ' )';
        CoAuditLog::insertAuditLog(CoRoomChargeItem::tableName(), $this->charge_item_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}
