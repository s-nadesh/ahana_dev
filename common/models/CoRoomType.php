<?php

namespace common\models;

use common\models\query\CoRoomTypeQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_room_type".
 *
 * @property integer $room_type_id
 * @property integer $tenant_id
 * @property string $room_type_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoRoomCharge[] $coRoomCharges
 * @property CoTenant $tenant
 */
class CoRoomType extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_room_type';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['room_type_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['room_type_name'], 'string', 'max' => 50],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'room_type_name', 'deleted_at'], 'message' => 'The combination of Room Type Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'room_type_id' => 'Room Type ID',
            'tenant_id' => 'Tenant ID',
            'room_type_name' => 'Bed Type Name',
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
    public function getCoRoomCharges() {
        return $this->hasMany(CoRoomCharge::className(), ['room_type_id' => 'room_type_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoRoomTypeQuery(get_called_class());
    }

    public static function getRoomTypelist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Bed Type Added Successfully (#' . $this->room_type_name . ' )';
        else
            $activity = 'Bed Type Updated Successfully (#' . $this->room_type_name . ' )';
        CoAuditLog::insertAuditLog(CoRoomType::tableName(), $this->room_type_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
